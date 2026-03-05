import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Searchbar,
  Surface,
  Text,
} from "react-native-paper";
import FavoritesContext from "../context/FavoritesContext";
import ProductCard from "../components/ProductCard";
import FilterChip from "../components/FilterChip";
import {
  formatPercentOff,
  getCostNumber,
  fetchHandbags,
} from "../utils/handbag";
import { Colors, Spacing, Typography, Radius } from "../theme";

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
          <ActivityIndicator animating size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ─ Header ─────────────────────────────────────────────── */}
        <View style={styles.headerBlock}>
          <Text style={styles.eyebrow}>COLLECTION</Text>
          <Text style={styles.title}>Handbags</Text>
        </View>

        {/* ─ Search ─────────────────────────────────────────────── */}
        <Searchbar
          placeholder="Search handbags…"
          onChangeText={setQ}
          value={q}
          style={styles.searchbar}
          inputStyle={styles.searchbarInput}
          iconColor={Colors.accent}
          elevation={0}
        />

        {/* ─ Error ──────────────────────────────────────────────── */}
        {error ? (
          <Surface style={styles.errorBox} elevation={0}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <Text style={styles.retryLink} onPress={load}>
              Tap to retry
            </Text>
          </Surface>
        ) : null}

        {/* ─ Filter chips ───────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {categories.map((c) => (
            <FilterChip
              key={c}
              label={c}
              active={c === category}
              onPress={() => setCategory(c)}
            />
          ))}
        </ScrollView>

        {/* ─ Count ──────────────────────────────────────────────── */}
        <Text style={styles.countLabel}>
          {filtered.length} {filtered.length === 1 ? "item" : "items"}
        </Text>

        {/* ─ Grid ───────────────────────────────────────────────── */}
        <View style={styles.grid}>
          {filtered.map((x) => (
            <ProductCard
              key={x.id}
              item={x}
              isFavorite={fav?.isFavorite?.(String(x?.id))}
              onPress={() => navigation.navigate("Detail", { item: x })}
              onFavorite={() => {
                const id = String(x?.id);
                if (fav?.isFavorite?.(id)) fav.removeFavorite(id);
                else fav.addFavorite(id);
              }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 60 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Header
  headerBlock: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  eyebrow: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    letterSpacing: Typography.letterSpacingWidest,
    marginBottom: 4,
  },
  title: {
    fontSize: Typography.fontSizeDisplay,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    letterSpacing: Typography.letterSpacingTight,
    lineHeight: Typography.lineHeightDisplay,
  },

  // Loading
  loadingText: {
    marginTop: Spacing.base,
    fontSize: Typography.fontSizeMD,
    color: Colors.textSecondary,
  },

  // Search
  searchbar: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchbarInput: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textPrimary,
  },

  // Section label (e.g. "Category")
  sectionLabel: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    letterSpacing: Typography.letterSpacingWidest,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },

  // Chip row
  chipRow: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xl,
  },

  // Count
  countLabel: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    letterSpacing: Typography.letterSpacingWide,
  },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  // Error
  errorBox: {
    marginBottom: Spacing.base,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: Colors.errorContainer,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: Typography.fontSizeMD,
    color: Colors.errorText,
    fontWeight: Typography.fontWeightSemiBold,
  },
  retryLink: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSizeSM,
    color: Colors.accent,
    fontWeight: Typography.fontWeightSemiBold,
    textDecorationLine: "underline",
  },
});

export default HomeScreen;
