import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Card,
  Chip,
  Text,
  Searchbar,
  Badge,
  IconButton,
  Surface,
} from "react-native-paper";
import { Heart, Search } from "lucide-react-native";
import FavoritesContext from "../context/FavoritesContext";
import Stars from "../components/Stars";
import {
  formatPercentOff,
  getCostNumber,
  fetchHandbags,
} from "../utils/handbag";

function HomeScreen({ navigation }) {
  const fav = useContext(FavoritesContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brand, setBrand] = useState("All");
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHandbags();
      const sorted = [...data].sort(
        (a, b) => getCostNumber(b) - getCostNumber(a),
      );
      setItems(sorted);
    } catch (e) {
      setError(e?.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const brands = useMemo(() => {
    const set = new Set();
    items.forEach((x) => {
      const b = (x?.brand || "").trim();
      if (b) set.add(b);
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const categories = useMemo(() => {
    const set = new Set();
    items.forEach((x) => {
      const c = (x?.category || "").trim();
      if (c) set.add(c);
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return items.filter((x) => {
      const okBrand = brand === "All" ? true : (x?.brand || "") === brand;
      const okCategory =
        category === "All" ? true : (x?.category || "") === category;
      const okName = !qq
        ? true
        : String(x?.handbagName || x?.name || "")
            .toLowerCase()
            .includes(qq);
      return okBrand && okCategory && okName;
    });
  }, [items, brand, category, q]);

  if (loading || fav?.loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator animating={true} size="large" color="#FF6B6B" />
          <Text variant="bodyLarge" style={{ marginTop: 16 }}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="headlineLarge" style={styles.title}>
          Handbags Collection
        </Text>
        {error ? (
          <Surface style={styles.errorBox} elevation={1}>
            <Text variant="bodyMedium" style={styles.errorText}>
              Error: {error}
            </Text>
            <Pressable style={styles.btn} onPress={load}>
              <Text style={styles.btnText}>Retry</Text>
            </Pressable>
          </Surface>
        ) : null}
        <Searchbar
          placeholder="Search handbags..."
          onChangeText={setQ}
          value={q}
          style={styles.searchbar}
          iconColor="#FF6B6B"
          elevation={2}
        />

        <Text variant="titleMedium" style={styles.label}>
          Filter by Category
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
        >
          {categories.map((c) => {
            const active = c === category;
            return (
              <Chip
                key={c}
                selected={active}
                onPress={() => setCategory(c)}
                mode={active ? "flat" : "outlined"}
                style={[styles.chip, active && styles.chipActive]}
                textStyle={{ fontWeight: active ? "bold" : "normal" }}
              >
                {c}
              </Chip>
            );
          })}
        </ScrollView>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
            marginBottom: 8,
          }}
        >
          <Text variant="titleMedium" style={{ flex: 1 }}>
            {filtered.length} {filtered.length === 1 ? "Item" : "Items"}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          {filtered.map((x) => {
            const percent = formatPercentOff(x?.percentOff);
            const favorite = fav?.isFavorite?.(String(x?.id));
            return (
              <Card
                key={x.id}
                style={[styles.card, { width: "48%", marginBottom: 12 }]}
                onPress={() => navigation.navigate("Detail", { item: x })}
              >
                <View style={styles.cardImageContainer}>
                  <Image
                    source={{ uri: x?.uri }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  <IconButton
                    icon={() => (
                      <Heart
                        size={20}
                        color={favorite ? "#FF6B6B" : "#9CA3AF"}
                        fill={favorite ? "#FF6B6B" : "transparent"}
                      />
                    )}
                    size={20}
                    onPress={() => {
                      const id = String(x?.id);
                      if (favorite) fav.removeFavorite(id);
                      else fav.addFavorite(id);
                    }}
                    style={styles.favButtonTopRight}
                    containerColor="#FFFFFF"
                  />
                </View>
                <Card.Content style={styles.cardContent}>
                  <Text
                    variant="titleSmall"
                    numberOfLines={2}
                    style={styles.cardTitle}
                  >
                    {x?.handbagName || x?.name || "Unnamed"}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={styles.cardBrand}
                    numberOfLines={1}
                  >
                    {x?.brand || "Unknown"}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text variant="titleMedium" style={styles.price}>
                      ${getCostNumber(x)}
                    </Text>
                    {percent ? (
                      <Badge size={20} style={styles.discountBadge}>
                        -{percent}
                      </Badge>
                    ) : null}
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F5F5" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  searchbar: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  label: {
    marginTop: 8,
    marginBottom: 8,
    color: "#424242",
    fontWeight: "600",
  },
  chip: {
    backgroundColor: "#FFFFFF",
  },
  chipActive: {
    backgroundColor: "#FF6B6B",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
  },
  cardImageContainer: {
    position: "relative",
    width: "100%",
    height: 192,
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  favButtonTopRight: {
    position: "absolute",
    top: 4,
    right: 4,
    margin: 0,
    elevation: 4,
  },
  cardContent: {
    paddingTop: 12,
    paddingBottom: 8,
    gap: 4,
  },
  cardTitle: {
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  cardBrand: {
    color: "#757575",
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  price: {
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  discountBadge: {
    backgroundColor: "#D32F2F",
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
    marginTop: 8,
  },
  btnText: { color: "#FFFFFF", fontWeight: "600" },
  errorBox: {
    marginTop: 12,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFEBEE",
  },
  errorText: { color: "#C62828", fontWeight: "600" },
});

export default HomeScreen;
