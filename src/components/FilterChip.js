/**
 * FilterChip – luxury outlined / filled category chip
 *
 * Props:
 *   label     – string
 *   active    – boolean
 *   onPress   – () => void
 */
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Colors, Radius, Typography, Spacing } from "../theme";

export default function FilterChip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
        pressed && styles.chipPressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          active ? styles.labelActive : styles.labelInactive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.chip,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  chipInactive: {
    backgroundColor: "transparent",
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipPressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: Typography.fontSizeSM,
    letterSpacing: Typography.letterSpacingWide,
  },
  labelInactive: {
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
  },
  labelActive: {
    fontWeight: Typography.fontWeightBold,
    color: Colors.textOnAccent,
  },
});
