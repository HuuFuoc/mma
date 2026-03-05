import React, {
  useCallback,
  useMemo,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Vibration,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Snackbar,
  Surface,
  Divider,
} from "react-native-paper";
import { Trash2, CheckSquare, X, ShoppingBag } from "lucide-react-native";
import FavoritesContext from "../context/FavoritesContext";
import { getCostNumber, fetchHandbags } from "../utils/handbag";
import { Colors, Spacing, Radius, Shadows, Typography } from "../theme";
import SwipeableItem from "../components/SwipeableItem";
import ImagePreviewModal from "../components/ImagePreviewModal";

function FavoritesScreen({ navigation }) {
  const fav = useContext(FavoritesContext);
  const [itemsById, setItemsById] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  // Swipe-to-delete undo
  const [snackVisible, setSnackVisible] = useState(false);
  const [undoItem, setUndoItem] = useState(null); // { id: string }
  // Bulk delete confirmation sheet
  const [bulkSheet, setBulkSheet] = useState(false);
  // Image full-screen preview
  const [previewImage, setPreviewImage] = useState(null);
  // Refs to all SwipeableItem instances so we can snap them shut on mode change
  const swipeRefs = useRef(new Map());

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
      .map((id) => {
        const item = itemsById.get(String(id));
        return item;
      })
      .filter((item) => item && item.id && item.handbagName)
      .sort((a, b) => getCostNumber(b) - getCostNumber(a));
    return list;
  }, [fav?.favoriteIds, itemsById]);

  const handleLongPress = (id) => {
    Vibration.vibrate(50); // short haptic buzz
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
    if (selectedIds.size === 0) return;
    setBulkSheet(true);
  };

  const cancelMultiSelect = () => {
    // Ensure we exit selection mode first to avoid any transient UI state
    // where stale selectedIds influences rendering.
    setMultiSelect(false);
    setSelectedIds(new Set());
  };

  // Close all open swipe rows when entering selection mode
  useEffect(() => {
    if (multiSelect) {
      swipeRefs.current.forEach((r) => r?.close?.());
    }
  }, [multiSelect]);

  // Swipe-to-delete handler — removes item and arms undo
  const handleSwipeDelete = useCallback(
    (itemId) => {
      fav.removeFavorite(itemId);
      setUndoItem({ id: itemId });
      setSnackVisible(true);
    },
    [fav],
  );

  const handleUndo = useCallback(() => {
    if (undoItem) fav.addFavorite(undoItem.id);
    setUndoItem(null);
    setSnackVisible(false);
  }, [undoItem, fav]);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(favItems.map((x) => String(x.id))));
  }, [favItems]);

  const confirmBulkDelete = useCallback(() => {
    selectedIds.forEach((id) => fav.removeFavorite(id));
    setSelectedIds(new Set());
    setMultiSelect(false);
    setBulkSheet(false);
  }, [selectedIds, fav]);

  if (fav?.loading || loading) {
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
        showsVerticalScrollIndicator={false}
      >
        {/* ─ Header ────────────────────────────────────────────── */}
        <View style={styles.headerBlock}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>WISHLIST</Text>
              <Text style={styles.title}>My Favorites</Text>
            </View>
            {!multiSelect && favItems.length > 0 && (
              <Pressable
                onPress={() => {
                  Alert.alert("Clear all", "Remove all favorites?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear",
                      style: "destructive",
                      onPress: () => fav.clearFavorites(),
                    },
                  ]);
                }}
                style={({ pressed }) => [
                  styles.clearBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Trash2 size={16} color={Colors.error} />
                <Text style={styles.clearBtnText}>Clear all</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.subtitle}>
            {favItems.length === 0
              ? "No favorites yet"
              : `${favItems.length} ${favItems.length === 1 ? "item" : "items"}`}
          </Text>
        </View>

        {/* ─ Multi-select toolbar ─────────────────────────────── */}
        {multiSelect && (
          <View style={styles.multiSelectToolbar}>
            <View style={styles.multiSelectLeft}>
              <CheckSquare size={18} color={Colors.accent} />
              <Text style={styles.multiSelectText}>
                {selectedIds.size} selected
              </Text>
            </View>
            <View style={styles.multiSelectRight}>
              {/* Select All */}
              <Pressable
                onPress={selectAll}
                style={({ pressed }) => [
                  styles.toolbarBtn,
                  styles.toolbarBtnSelect,
                  pressed && { opacity: 0.75 },
                ]}
              >
                <Text style={styles.toolbarBtnSelectText}>All</Text>
              </Pressable>
              <Pressable
                onPress={deleteSelected}
                style={({ pressed }) => [
                  styles.toolbarBtn,
                  styles.toolbarBtnDanger,
                  pressed && { opacity: 0.75 },
                ]}
              >
                <Trash2 size={16} color={Colors.textOnAccent} />
                <Text style={styles.toolbarBtnText}>Delete</Text>
              </Pressable>
              <Pressable
                onPress={cancelMultiSelect}
                style={({ pressed }) => [
                  styles.toolbarBtn,
                  styles.toolbarBtnCancel,
                  pressed && { opacity: 0.75 },
                ]}
              >
                <X size={16} color={Colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        )}

        {/* ─ Error ─────────────────────────────────────────────── */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        {/* ─ List ──────────────────────────────────────────────── */}
        {favItems.map((x) => {
          const itemId = String(x.id);
          const isSelected = selectedIds.has(itemId);

          return (
            <Pressable
              key={`fav-${itemId}`}
              onPress={() => {
                if (multiSelect) toggleSelect(itemId);
                else navigation.navigate("Detail", { item: x });
              }}
              onLongPress={() => handleLongPress(itemId)}
              style={({ pressed }) => [
                styles.card,
                isSelected && styles.cardSelected,
                pressed && styles.cardPressed,
              ]}
            >
              {/* Image */}
              <View style={styles.imageContainer}>
                {x?.uri ? (
                  <Image
                    source={{ uri: x.uri }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.productImage,
                      { backgroundColor: Colors.surfaceSubtle },
                    ]}
                  />
                )}
                {/* Selected checkmark badge */}
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <CheckSquare size={16} color={Colors.textOnAccent} />
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={styles.infoContainer}>
                <View style={styles.infoTop}>
                  <Text style={styles.cardBrand}>
                    {(x?.brand || "Unknown").toUpperCase()}
                  </Text>
                  <Text numberOfLines={2} style={styles.cardTitle}>
                    {x?.handbagName || x?.name || "Unnamed"}
                  </Text>
                  <Text style={styles.cardPrice}>${getCostNumber(x)}</Text>
                </View>

                {/* Per-item actions (only when not in multi-select) */}
                {!multiSelect && (
                  <View style={styles.itemActions}>
                    {/* Add to Bag mini-CTA */}
                    <Pressable
                      onPress={() => {
                        // TODO: wire to cart/bag context
                      }}
                      style={({ pressed }) => [
                        styles.addToBagBtn,
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <ShoppingBag size={13} color={Colors.textOnAccent} />
                      <Text style={styles.addToBagText}>Add to Bag</Text>
                    </Pressable>

                    {/* Delete */}
                    <Pressable
                      onPress={() => {
                        Alert.alert(
                          "Remove",
                          `Remove “${x?.handbagName || x?.name || "this item"}” from favorites?`,
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
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.deleteBtn,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Trash2 size={16} color={Colors.error} />
                    </Pressable>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}

        {/* ─ Empty state ───────────────────────────────────────── */}
        {favItems.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>♡</Text>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart on any bag to save it here.
            </Text>
            <Pressable
              onPress={() => navigation.navigate("Main", { screen: "Home" })}
              style={({ pressed }) => [
                styles.browseBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.browseBtnText}>Browse Collection</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* ─ Undo snackbar ─────────────────────────────────────────── */}
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={4500}
        action={{ label: "Undo", onPress: handleUndo }}
        style={styles.snackbar}
        theme={{
          colors: {
            inverseSurface: Colors.card,
            inverseOnSurface: Colors.textPrimary,
            inversePrimary: Colors.accent,
          },
        }}
      >
        Removed from favorites
      </Snackbar>

      {/* ─ Bulk delete confirmation sheet ──────────────────────────── */}
      <Modal
        transparent
        visible={bulkSheet}
        animationType="fade"
        onRequestClose={() => setBulkSheet(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setBulkSheet(false)}
          />
          <View style={styles.bulkSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              Delete {selectedIds.size} item
              {selectedIds.size !== 1 ? "s" : ""}?
            </Text>
            <Text style={styles.sheetBody}>
              These will be removed from your wishlist permanently.
            </Text>
            <Pressable
              onPress={confirmBulkDelete}
              style={({ pressed }) => [
                styles.sheetDeleteBtn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.sheetDeleteText}>Delete</Text>
            </Pressable>
            <Pressable
              onPress={() => setBulkSheet(false)}
              style={({ pressed }) => [
                styles.sheetCancelBtn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ─ Image preview modal ──────────────────────────────────────── */}
      <ImagePreviewModal
        visible={!!previewImage}
        uri={previewImage || ""}
        onClose={() => setPreviewImage(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 60 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: {
    marginTop: Spacing.base,
    fontSize: Typography.fontSizeMD,
    color: Colors.textSecondary,
  },

  // Header
  headerBlock: { marginTop: Spacing.sm, marginBottom: Spacing.xl },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  eyebrow: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    letterSpacing: Typography.letterSpacingWidest,
    marginBottom: 2,
  },
  title: {
    fontSize: Typography.fontSizeDisplay,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    letterSpacing: Typography.letterSpacingTight,
    lineHeight: Typography.lineHeightDisplay,
  },
  subtitle: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textSecondary,
    letterSpacing: Typography.letterSpacingWide,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.chip,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  clearBtnText: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.error,
    letterSpacing: Typography.letterSpacingWide,
  },

  // Multi-select toolbar
  multiSelectToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    marginBottom: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  multiSelectLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  multiSelectText: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.accent,
  },
  multiSelectRight: { flexDirection: "row", gap: Spacing.sm },
  toolbarBtn: {
    height: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.chip,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  toolbarBtnDanger: { backgroundColor: Colors.error },
  toolbarBtnCancel: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toolbarBtnText: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textOnAccent,
  },

  // Cards
  card: {
    flexDirection: "row",
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    ...Shadows.card,
  },
  cardSelected: {
    borderColor: Colors.accent,
    borderWidth: 2,
    backgroundColor: Colors.accentLight,
  },
  cardPressed: { opacity: 0.88 },

  // Card image
  imageContainer: {
    width: 110,
    height: 130,
    backgroundColor: Colors.imagePlaceholder,
  },
  productImage: { width: "100%", height: "100%" },
  checkBadge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  // Card info
  infoContainer: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "space-between",
  },
  infoTop: { gap: 3 },
  cardBrand: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    letterSpacing: Typography.letterSpacingWidest,
  },
  cardTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeightBody,
  },
  cardPrice: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.accent,
    letterSpacing: Typography.letterSpacingTight,
  },

  // Per-item action row
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  addToBagBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.chip,
    backgroundColor: Colors.accent,
  },
  addToBagText: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textOnAccent,
    letterSpacing: Typography.letterSpacingWide,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.errorContainer,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.error,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    color: Colors.surface,
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    letterSpacing: Typography.letterSpacingTight,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: Typography.lineHeightBody,
    marginBottom: Spacing.xl,
  },
  browseBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.input,
    backgroundColor: Colors.accent,
  },
  browseBtnText: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textOnAccent,
    letterSpacing: Typography.letterSpacingWide,
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
  // Toolbar additions
  toolbarBtnSelect: {
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  toolbarBtnSelectText: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightBold,
    color: Colors.accent,
  },

  // Undo snackbar
  snackbar: {
    marginBottom: Spacing.xs,
    borderRadius: Radius.md,
  },

  // Bulk delete confirmation sheet
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: Colors.overlay,
  },
  bulkSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
    ...Shadows.sheet,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: Spacing.base,
  },
  sheetTitle: {
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    letterSpacing: Typography.letterSpacingTight,
    marginBottom: Spacing.sm,
  },
  sheetBody: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeightBody,
  },
  sheetDeleteBtn: {
    backgroundColor: Colors.error,
    paddingVertical: Spacing.md,
    borderRadius: Radius.input,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sheetDeleteText: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
    color: "#fff",
    letterSpacing: Typography.letterSpacingWide,
  },
  sheetCancelBtn: {
    backgroundColor: Colors.surfaceSubtle,
    paddingVertical: Spacing.md,
    borderRadius: Radius.input,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sheetCancelText: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
  },
});

export default FavoritesScreen;
