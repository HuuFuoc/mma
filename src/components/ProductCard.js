/**
 * ProductCard – luxury 2-column grid card
 *
 * Props:
 *   item          – handbag data object
 *   isFavorite    – boolean
 *   onPress       – () => void  (navigate to detail)
 *   onFavorite    – () => void  (toggle wishlist)
 */
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Heart } from "lucide-react-native";
import { Colors, Radius, Shadows, Typography, Spacing } from "../theme";
import { formatPercentOff, getCostNumber } from "../utils/handbag";

export default function ProductCard({ item, isFavorite, onPress, onFavorite }) {
  const percent = formatPercentOff(item?.percentOff);
  const price = getCostNumber(item);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* ── Image area ─────────────────────────────────────────────── */}
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: item?.uri }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Heart overlay — top-right over image */}
        <Pressable
          onPress={onFavorite}
          hitSlop={8}
          style={({ pressed }) => [
            styles.heartBtn,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Heart
            size={18}
            color={isFavorite ? Colors.wishlist : Colors.textDisabled}
            fill={isFavorite ? Colors.wishlist : "transparent"}
          />
        </Pressable>

        {/* Discount pill — bottom-left over image */}
        {percent ? (
          <View style={styles.discountPill}>
            <Text style={styles.discountText}>−{percent}</Text>
          </View>
        ) : null}
      </View>

      {/* ── Info area ──────────────────────────────────────────────── */}
      <View style={styles.info}>
        {/* Brand — small, muted, uppercase tracking */}
        <Text numberOfLines={1} style={styles.brand}>
          {(item?.brand || "Unknown").toUpperCase()}
        </Text>

        {/* Name — 2 lines max, dominant */}
        <Text numberOfLines={2} style={styles.name}>
          {item?.handbagName || item?.name || "Unnamed"}
        </Text>

        {/* Price row */}
        <Text style={styles.price}>${price}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    ...Shadows.card,
  },
  cardPressed: {
    opacity: 0.88,
  },

  // Image
  imageWrap: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: Colors.imagePlaceholder,
  },
  image: {
    width: "100%",
    height: "100%",
  },

  // Heart button — floating over image top-right
  heartBtn: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: "rgba(254,250,224,0.88)", // ivory translucent
    alignItems: "center",
    justifyContent: "center",
  },

  // Discount pill — floating over image bottom-left
  discountPill: {
    position: "absolute",
    bottom: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
  },
  discountText: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textOnAccent,
    letterSpacing: Typography.letterSpacingWide,
  },

  // Info block
  info: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: 3,
  },
  brand: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    letterSpacing: Typography.letterSpacingWidest,
  },
  name: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeightBody,
    letterSpacing: Typography.letterSpacingTight,
  },
  price: {
    marginTop: 4,
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.accent,
    letterSpacing: Typography.letterSpacingTight,
  },
});
