import React, { useCallback, useMemo, useState, useContext } from "react";
import { Alert, Image, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Text,
  Card,
  IconButton,
  FAB,
  Chip,
  Surface,
  Divider,
} from "react-native-paper";
import { Trash2, CheckSquare, X } from "lucide-react-native";
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
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="headlineLarge" style={styles.title}>
              My Favorites
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {favItems.length === 0
                ? "No favorites yet."
                : `${favItems.length} ${favItems.length === 1 ? "item" : "items"}`}
            </Text>
          </View>
          {!multiSelect && favItems.length > 0 && (
            <IconButton
              icon={() => <Trash2 size={20} color="#D32F2F" />}
              size={24}
              mode="contained-tonal"
              containerColor="#FFEBEE"
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
            />
          )}
        </View>

        {/* Multi-select Toolbar */}
        {multiSelect && (
          <Surface style={styles.multiSelectToolbar} elevation={2}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <CheckSquare size={20} color="#FF6B6B" />
              <Text variant="titleMedium" style={{ color: "#FF6B6B" }}>
                {selectedIds.size} selected
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <IconButton
                icon={() => <Trash2 size={20} color="#FFFFFF" />}
                size={24}
                mode="contained"
                containerColor="#D32F2F"
                onPress={deleteSelected}
              />
              <IconButton
                icon={() => <X size={20} color="#FFFFFF" />}
                size={24}
                mode="contained"
                containerColor="#757575"
                onPress={cancelMultiSelect}
              />
            </View>
          </Surface>
        )}

        {error && (
          <Surface style={styles.errorBox} elevation={1}>
            <Text variant="bodyMedium" style={styles.errorText}>
              Error: {error}
            </Text>
          </Surface>
        )}

        {/* Favorites List */}
        <View style={{ marginTop: 8 }}>
          {favItems.map((x) => {
            const itemId = String(x.id);
            const isSelected = selectedIds.has(itemId);
            return (
              <Card
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
                mode={isSelected ? "elevated" : "outlined"}
                elevation={isSelected ? 4 : 0}
              >
                <View style={styles.cardContent}>
                  {/* Image */}
                  {x?.uri ? (
                    <Card.Cover
                      source={{ uri: x.uri }}
                      style={styles.productImage}
                    />
                  ) : (
                    <View
                      style={[
                        styles.productImage,
                        { backgroundColor: "#F5F5F5" },
                      ]}
                    />
                  )}

                  {/* Content */}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          variant="titleMedium"
                          numberOfLines={2}
                          style={styles.cardTitle}
                        >
                          {x?.handbagName || x?.name || "Unnamed"}
                        </Text>
                        <Text variant="bodySmall" style={styles.cardBrand}>
                          {x?.brand || "Unknown brand"}
                        </Text>
                        <Text variant="titleLarge" style={styles.cardPrice}>
                          ${getCostNumber(x)}
                        </Text>
                      </View>

                      {/* Actions */}
                      {!multiSelect && (
                        <IconButton
                          icon={() => <Trash2 size={18} color="#D32F2F" />}
                          size={20}
                          mode="contained-tonal"
                          containerColor="#FFEBEE"
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
                        />
                      )}
                    </View>

                    {/* Selection Indicator */}
                    {multiSelect && isSelected && (
                      <Chip
                        icon="check"
                        mode="flat"
                        style={styles.selectedChip}
                        textStyle={{ color: "#FFFFFF", fontWeight: "bold" }}
                      >
                        Selected
                      </Chip>
                    )}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Empty State */}
        {favItems.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text variant="displaySmall">💝</Text>
            <Text
              variant="titleLarge"
              style={{ marginTop: 16, color: "#757575" }}
            >
              No Favorites Yet
            </Text>
            <Text
              variant="bodyMedium"
              style={{ marginTop: 8, color: "#9E9E9E", textAlign: "center" }}
            >
              Items you favorite will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F5F5" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  subtitle: {
    marginTop: 4,
    color: "#757575",
  },
  multiSelectToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#FFE8E8",
  },
  card: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: "#FF6B6B",
    borderWidth: 2,
    backgroundColor: "#FFF5F5",
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  cardTitle: {
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  cardBrand: {
    color: "#757575",
    marginBottom: 8,
  },
  cardPrice: {
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  selectedChip: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#FF6B6B",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  errorBox: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFEBEE",
  },
  errorText: { color: "#C62828", fontWeight: "600" },
});

export default FavoritesScreen;
