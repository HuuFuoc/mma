/**
 * BottomCTABar – sticky "Add to Bag" bar for Product Detail screen
 *
 * Props:
 *   price        – number | string  (formatted price, e.g. "325")
 *   percentOff   – string | null    (e.g. "20%"), null if no discount
 *   onAddToBag   – () => void
 *   disabled     – boolean (optional)
 */
import React from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Radius, Shadows, Typography, Spacing } from "../theme";

export default function BottomCTABar({
  price,
  percentOff,
  onAddToBag,
  disabled = false,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, Spacing.base) },
      ]}
    >
      {/* Price block */}
      <View style={styles.priceBlock}>
        <Text style={styles.label}>Price</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${price}</Text>
          {percentOff ? (
            <View style={styles.discountPill}>
              <Text style={styles.discountText}>−{percentOff}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* CTA button */}
      <Pressable
        onPress={onAddToBag}
        disabled={disabled}
        style={({ pressed }) => [
          styles.ctaBtn,
          disabled && styles.ctaBtnDisabled,
          pressed && !disabled && styles.ctaBtnPressed,
        ]}
      >
        <Text style={[styles.ctaLabel, disabled && styles.ctaLabelDisabled]}>
          Add to Bag
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.sheet,
  },

  // Price block
  priceBlock: {
    gap: 2,
  },
  label: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    letterSpacing: Typography.letterSpacingWidest,
    textTransform: "uppercase",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  price: {
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    letterSpacing: Typography.letterSpacingTight,
  },
  discountPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  discountText: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
    color: Colors.accent,
  },

  // CTA
  ctaBtn: {
    height: 52,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.input,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 160,
  },
  ctaBtnDisabled: {
    backgroundColor: Colors.disabled,
  },
  ctaBtnPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textOnAccent,
    letterSpacing: Typography.letterSpacingWide,
  },
  ctaLabelDisabled: {
    color: Colors.textDisabled,
  },
});
