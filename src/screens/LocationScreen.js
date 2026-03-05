/**
 * LocationScreen – Route to Store
 *
 * Flow:
 *  1. Request location permission (Expo Location)
 *  2. Get current position (origin)
 *  3. Fetch OSRM driving route → decode polyline, distance, duration
 *  4. Render MapView: Marker A (You), Marker B (Store), Polyline (route)
 *     fit camera to show full route
 *
 * No API key required – uses free public OSRM routing server.
 * UI States: idle | loading | map | denied | error
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import MapView, { Marker, Polyline } from "react-native-maps";
import {
  MapPin,
  Navigation,
  AlertCircle,
  MapPinOff,
  Clock,
  Route,
} from "lucide-react-native";
import { Colors, Radius, Shadows, Spacing, Typography } from "../theme";

// ─── Config ──────────────────────────────────────────────────────────────────
// Canonical Google Maps link – single source of truth
const MAPS_SHORT_LINK = "https://maps.app.goo.gl/QCAwK31WVR2sFVqQ6";
// AsyncStorage key for caching resolved destination
const CACHE_KEY = "@store_destination_cache";
// Fallback when link can’t be resolved (offline / bot-block)
const FALLBACK_DESTINATION = {
  lat: 10.8626,
  lng: 106.7915,
  name: "Our Store",
  address: "110/15 Đường Lò Lu, Trường Thạnh, Thủ Đức, TP.HCM",
};

const EDGE_PADDING = { top: 100, right: 60, bottom: 220, left: 60 };

// ─── URL coordinate parsers ─────────────────────────────────────────────────
/**
 * Priority 1: "/@lat,lng" – present in most /maps/place/ URLs
 * e.g. https://www.google.com/maps/place/Name/@10.8626,106.7915,17z/...
 */
function parseAtCoords(url) {
  const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  return null;
}

/**
 * Priority 2: "!3dLAT!4dLNG" – embedded in the data= fragment
 * e.g. ...!3d10.8626!4d106.7915...
 */
function parseDataCoords(url) {
  const m = url.match(/!3d(-?\d+\.?\d+)!4d(-?\d+\.?\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  return null;
}

/**
 * Extract a human-readable place name from the URL path segment.
 * e.g. /maps/place/Tr%C6%B0%E1%BB%9Dng+Th%E1%BA%A1nh/ → "Trường Thạnh"
 */
function parsePlaceName(url) {
  try {
    const m = url.match(/\/maps\/place\/([^/@?]+)/);
    if (m) return decodeURIComponent(m[1].replace(/\+/g, " ")).trim();
  } catch (_) {}
  return null;
}

/** Run both coordinate parsers; return { lat, lng } or null */
function parseCoordinatesFromUrl(url) {
  return parseAtCoords(url) ?? parseDataCoords(url);
}

// ─── Resolve Google Maps short link ─────────────────────────────────────────────
/**
 * Follows all redirects (React Native fetch auto-follows).
 * response.url = final URL after redirect chain.
 * Returns { lat, lng, name, address } or null if parse fails.
 */
async function resolveGoogleMapsLink(shortUrl) {
  try {
    const res = await fetch(shortUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        // Browser-like UA helps Google return the full /maps/place/ URL
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
          "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
    });
    const finalUrl = res.url ?? shortUrl;
    const coords = parseCoordinatesFromUrl(finalUrl);
    if (!coords) return null;
    const name = parsePlaceName(finalUrl) ?? FALLBACK_DESTINATION.name;
    return {
      lat: coords.lat,
      lng: coords.lng,
      name,
      address: FALLBACK_DESTINATION.address, // address text stays factual
    };
  } catch (_) {
    return null;
  }
}

// ─── Cached destination resolution ───────────────────────────────────────────
/**
 * 1. Return cached value immediately (fast render).
 * 2. Then background-refresh from the link and update cache.
 * 3. If both fail → fallback hardcoded coords.
 */
async function getDestination() {
  // Try cache first
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached?.lat && cached?.lng) {
        // Kick off a background refresh (fire-and-forget)
        resolveGoogleMapsLink(MAPS_SHORT_LINK).then((fresh) => {
          if (fresh) AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
        });
        return cached;
      }
    }
  } catch (_) {}

  // Cache miss – resolve now
  const resolved = await resolveGoogleMapsLink(MAPS_SHORT_LINK);
  if (resolved) {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(resolved));
    } catch (_) {}
    return resolved;
  }

  // Full fallback
  return FALLBACK_DESTINATION;
}

// ─── Polyline decoder (Google encoded polyline algorithm) ────────────────────
function decodePolyline(encoded) {
  const points = [];
  let index = 0,
    lat = 0,
    lng = 0;
  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

// ─── OSRM Directions (free, no API key) ─────────────────────────────────────
async function fetchDirections(origin, destination) {
  const coords = `${origin.longitude},${origin.latitude};${destination.lng},${destination.lat}`;
  const url =
    `https://router.project-osrm.org/route/v1/driving/${coords}` +
    `?overview=full&geometries=polyline`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.code !== "Ok" || !json.routes?.length) {
    throw new Error("Route not found. Check your internet connection.");
  }
  const route = json.routes[0];
  const distKm = (route.distance / 1000).toFixed(1);
  const durationMin = Math.ceil(route.duration / 60);
  return {
    routeCoords: decodePolyline(route.geometry),
    distance: `${distKm} km`,
    duration: `${durationMin} min`,
  };
}

// ─── Permission + location helpers ───────────────────────────────────────────
async function requestPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status;
}

async function getPosition() {
  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
    timeInterval: 10000,
    distanceInterval: 0,
  });
  return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
}

// ─── Sub-UI helpers ───────────────────────────────────────────────────────────
function CenterCard({ children }) {
  return (
    <View style={card.wrapper}>
      <View style={card.box}>{children}</View>
    </View>
  );
}

const card = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  box: {
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.base,
    ...Shadows.card,
  },
});

function PrimaryButton({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
    >
      <Text style={styles.btnLabel}>{label}</Text>
    </Pressable>
  );
}

function GhostButton({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.ghostBtnLabel}>{label}</Text>
    </Pressable>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function LocationScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  // 'idle' | 'loading' | 'map' | 'denied' | 'error'
  const [uiState, setUiState] = useState("idle");
  const [loadingStep, setLoadingStep] = useState("Starting…");
  const [errorMsg, setErrorMsg] = useState("");

  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null); // { lat, lng, name, address }
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null); // { distance, duration }

  // Silent permission check on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "granted") loadRoute();
      else if (status === "denied") setUiState("denied");
    })();
  }, []);

  // ── Core flow ────────────────────────────────────────────────────────────
  const loadRoute = useCallback(async () => {
    setUiState("loading");
    setErrorMsg("");
    try {
      setLoadingStep("Getting your location…");
      const pos = await getPosition();
      setOrigin(pos);

      setLoadingStep("Finding the store…");
      const dest = await getDestination();
      setDestination(dest);

      setLoadingStep("Calculating route…");
      const {
        routeCoords: rc,
        distance,
        duration,
      } = await fetchDirections(pos, dest);
      setRouteCoords(rc);
      setRouteInfo({ distance, duration });

      setUiState("map");
    } catch (err) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
      setUiState("error");
    }
  }, []);

  const handleAllow = useCallback(async () => {
    setUiState("loading");
    setLoadingStep("Requesting permission…");
    const status = await requestPermission();
    if (status === "granted") {
      loadRoute();
    } else {
      setUiState("denied");
    }
  }, [loadRoute]);

  // ── Fit camera to route ───────────────────────────────────────────────────
  const fitRoute = useCallback(() => {
    if (!mapRef.current || !origin || !destination) return;
    const allCoords = [
      origin,
      { latitude: destination.lat, longitude: destination.lng },
      ...routeCoords,
    ];
    mapRef.current.fitToCoordinates(allCoords, {
      edgePadding: EDGE_PADDING,
      animated: true,
    });
  }, [origin, destination, routeCoords]);

  const onMapReady = useCallback(() => {
    setTimeout(fitRoute, 300);
  }, [fitRoute]);

  // ── Render: loading ───────────────────────────────────────────────────────
  if (uiState === "loading") {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <CenterCard>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.cardTitle}>Preparing Map</Text>
          <Text style={styles.cardBody}>{loadingStep}</Text>
        </CenterCard>
      </View>
    );
  }

  // ── Render: denied ────────────────────────────────────────────────────────
  if (uiState === "denied") {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <CenterCard>
          <MapPinOff size={40} color={Colors.accent} />
          <Text style={styles.cardTitle}>Location Denied</Text>
          <Text style={styles.cardBody}>
            Location access was denied. Please enable it in your device settings
            to see directions to our store.
          </Text>
          <PrimaryButton
            label="Open Settings"
            onPress={() => Linking.openSettings()}
          />
          <GhostButton label="Ask again" onPress={handleAllow} />
        </CenterCard>
      </View>
    );
  }

  // ── Render: error ─────────────────────────────────────────────────────────
  if (uiState === "error") {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <CenterCard>
          <AlertCircle size={40} color={Colors.error} />
          <Text style={styles.cardTitle}>Something went wrong</Text>
          <Text style={styles.cardBody}>{errorMsg}</Text>
          <PrimaryButton label="Try again" onPress={loadRoute} />
        </CenterCard>
      </View>
    );
  }

  // ── Render: map ───────────────────────────────────────────────────────────
  if (uiState === "map" && origin && destination) {
    const destCoord = { latitude: destination.lat, longitude: destination.lng };

    return (
      <View style={styles.mapRoot}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          onMapReady={onMapReady}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          initialRegion={{
            latitude: (origin.latitude + destination.lat) / 2,
            longitude: (origin.longitude + destination.lng) / 2,
            latitudeDelta:
              Math.abs(origin.latitude - destination.lat) * 2.5 + 0.02,
            longitudeDelta:
              Math.abs(origin.longitude - destination.lng) * 2.5 + 0.02,
          }}
        >
          {/* Route polyline */}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor={Colors.accent}
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          )}

          {/* Marker A – You */}
          <Marker coordinate={origin} title="You" anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.markerYou}>
              <View style={styles.markerYouDot} />
            </View>
          </Marker>

          {/* Marker B – Store */}
          <Marker
            coordinate={destCoord}
            title={destination.name ?? "Our Store"}
            description={destination.address ?? ""}
          >
            <View style={styles.markerStore}>
              <MapPin size={18} color={Colors.textOnAccent} />
            </View>
          </Marker>
        </MapView>

        {/* Top pill */}
        <View
          style={[styles.mapTopBar, { paddingTop: insets.top + Spacing.sm }]}
          pointerEvents="none"
        >
          <View style={styles.mapTitlePill}>
            <MapPin size={13} color={Colors.accent} />
            <Text style={styles.mapTitleText} numberOfLines={1}>
              {destination?.name ?? "Our Store"}
            </Text>
          </View>
        </View>

        {/* Info card */}
        {routeInfo && (
          <View style={[styles.infoCard, { bottom: insets.bottom + 76 }]}>
            <View style={styles.infoRow}>
              <Route size={15} color={Colors.accent} />
              <Text style={styles.infoValue}>{routeInfo.distance}</Text>
            </View>
            <View style={styles.infoSep} />
            <View style={styles.infoRow}>
              <Clock size={15} color={Colors.accent} />
              <Text style={styles.infoValue}>{routeInfo.duration}</Text>
            </View>
          </View>
        )}

        {/* Re-center FAB */}
        <Pressable
          onPress={fitRoute}
          hitSlop={12}
          style={({ pressed }) => [
            styles.fab,
            { bottom: insets.bottom + 76 },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Navigation size={20} color={Colors.textPrimary} />
        </Pressable>
      </View>
    );
  }

  // ── Render: idle (explain) ────────────────────────────────────────────────
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <CenterCard>
        <MapPin size={44} color={Colors.accent} />
        <Text style={styles.cardTitle}>Get Directions</Text>
        <Text style={styles.cardBody}>
          Allow location access to see the route from your current position to
          our store at 110/15 Đường Lò Lu, Thủ Đức.
        </Text>
        <PrimaryButton label="Allow Location" onPress={handleAllow} />
      </CenterCard>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  mapRoot: { flex: 1, backgroundColor: Colors.imagePlaceholder },

  // Top pill
  mapTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: Spacing.sm,
  },
  mapTitlePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(254,250,224,0.94)",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: "rgba(31,31,31,0.10)",
    ...Shadows.card,
  },
  mapTitleText: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    letterSpacing: Typography.letterSpacingWide,
  },

  // Info card
  infoCard: {
    position: "absolute",
    left: Spacing.base,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(254,250,224,0.94)",
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: "rgba(31,31,31,0.10)",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.base,
    ...Shadows.card,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  infoValue: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    letterSpacing: Typography.letterSpacingTight,
  },
  infoSep: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(31,31,31,0.12)",
  },

  // Re-center FAB
  fab: {
    position: "absolute",
    right: Spacing.base,
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: "rgba(254,250,224,0.94)",
    borderWidth: 1,
    borderColor: "rgba(31,31,31,0.10)",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.card,
  },

  // Marker: You
  markerYou: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(212,163,115,0.25)",
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  markerYouDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },

  // Marker: Store
  markerStore: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.background,
    ...Shadows.card,
  },

  // Card text
  cardTitle: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    textAlign: "center",
    letterSpacing: Typography.letterSpacingTight,
  },
  cardBody: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: Typography.lineHeightBody,
  },

  // Buttons
  btn: {
    width: "100%",
    paddingVertical: Spacing.md,
    borderRadius: Radius.input,
    backgroundColor: Colors.accent,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  btnPressed: { opacity: 0.85 },
  btnLabel: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textOnAccent,
    letterSpacing: Typography.letterSpacingWide,
  },
  ghostBtn: { paddingVertical: Spacing.sm, alignItems: "center" },
  ghostBtnLabel: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    textDecorationLine: "underline",
  },
});
