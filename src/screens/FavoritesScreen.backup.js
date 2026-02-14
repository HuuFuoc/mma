import React, { useCallback, useMemo, useState, useContext } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import FavoritesContext from "../context/FavoritesContext";
import { getCostNumber, fetchHandbags } from "../utils/handbag";

function FavoritesScreen({ navigation }) {
  const fav = useContext(FavoritesContext);
  const [itemsById, setItemsById] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHandbags();
      const map = new Map();
      data.forEach((x) => map.set(String(x.id), x));
      setItemsById(map);
    } catch (e) {
      setError(e?.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll]),
  );

  const favItems = useMemo(() => {
    const ids = fav?.favoriteIds || [];
    const list = ids
      .map((id) => itemsById.get(String(id)))
      .filter(Boolean)
      .sort((a, b) => getCostNumber(b) - getCostNumber(a));
    return list;
  }, [fav?.favoriteIds, itemsById]);

  const handleLongPress = (id) => {
    setMultiSelect(true);
    setSelectedIds(new Set([id]));
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    if (newSelected.size === 0) {
      setMultiSelect(false);
    }
  };

  const deleteSelected = () => {
    Alert.alert(
      "Delete items",
      `Remove ${selectedIds.size} item(s) from favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            selectedIds.forEach((id) => fav.removeFavorite(id));
            setSelectedIds(new Set());
            setMultiSelect(false);
          },
        },
      ],
    );
  };

  const cancelMultiSelect = () => {
    setMultiSelect(false);
    setSelectedIds(new Set());
  };

  if (fav?.loading || loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 10 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {multiSelect ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#F3F4F6",
              padding: 12,
              borderRadius: 12,
              marginBottom: 8,
            }}
          >
            <Text style={styles.title}>{selectedIds.size} selected</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                style={[styles.btn, { backgroundColor: "#B91C1C" }]}
                onPress={deleteSelected}
              >
                <Text style={styles.btnText}>Delete ({selectedIds.size})</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, { backgroundColor: "#6B7280" }]}
                onPress={cancelMultiSelect}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.title}>Favorites</Text>
            <Pressable
              style={[styles.btn, { backgroundColor: "#B91C1C" }]}
              onPress={() => {
                Alert.alert("Clear favorites", "Remove all favorites?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => fav.clearFavorites(),
                  },
                ]);
              }}
            >
              <Text style={styles.btnText}>Clear</Text>
            </Pressable>
          </View>
        )}
        {error ? <Text style={styles.errorText}>Error: {error}</Text> : null}
        <Text style={styles.muted}>
          {favItems.length === 0
            ? "No favorites yet."
            : `Items: ${favItems.length}`}
        </Text>
        <View style={{ marginTop: 12, gap: 10 }}>
          {favItems.map((x) => {
            const itemId = String(x.id);
            const isSelected = selectedIds.has(itemId);
            return (
              <Pressable
                key={x.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => {
                  if (multiSelect) {
                    toggleSelect(itemId);
                  } else {
                    navigation.navigate("Detail", { item: x });
                  }
                }}
                onLongPress={() => handleLongPress(itemId)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  {x?.uri ? (
                    <Image
                      source={{ uri: x.uri }}
                      style={styles.productImageSmall}
                      resizeMode="cover"
                    />
                  ) : null}
                  <View style={{ flex: 1 }}>
                    {multiSelect && isSelected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {x?.handbagName || x?.name || "Unnamed"}
                    </Text>
                    <Text style={styles.cardSub}>
                      {x?.brand || "Unknown brand"}
                    </Text>
                    <Text style={styles.cardSub}>
                      Cost: ${getCostNumber(x)}
                    </Text>
                  </View>
                  {!multiSelect && (
                    <Pressable
                      onPress={() => {
                        Alert.alert(
                          "Remove favorite",
                          `Remove "${x?.handbagName || x?.name || "this item"}" from favorites?`,
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Remove",
                              style: "destructive",
                              onPress: () => fav.removeFavorite(itemId),
                            },
                          ],
                        );
                      }}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.deleteBtnText}>🗑️</Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", color: "#111827" },
  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#fff",
  },
  cardSelected: {
    borderColor: "#111827",
    borderWidth: 2,
    backgroundColor: "#F3F4F6",
  },
  productImageSmall: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cardSub: { marginTop: 4, color: "#6B7280" },
  checkmark: {
    position: "absolute",
    top: -8,
    right: -8,
    fontSize: 24,
    color: "#111827",
    fontWeight: "bold",
  },
  favBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  favBtnActive: { backgroundColor: "#111827", borderColor: "#111827" },
  favBtnText: { fontSize: 20, color: "#111827" },
  favBtnTextActive: { color: "#fff" },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
  },
  deleteBtnText: { fontSize: 20 },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignSelf: "flex-start",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  muted: { marginTop: 6, color: "#6B7280" },
  errorText: { color: "#991B1B", fontWeight: "700" },
});

export default FavoritesScreen;
