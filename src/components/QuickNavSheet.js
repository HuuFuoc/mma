/**
 * QuickNavSheet – luxury slide-up sheet for fast tab navigation from Detail.
 * Built with built-in RN Animated + Modal (no extra library needed).
 * Tap the trigger icon → sheet slides up → one tap to navigate.
 */
import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Pressable,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { Home, Heart, MapPin, X } from "lucide-react-native";
import { Colors, Spacing, Radius, Shadows, Typography } from "../theme";

const NAV_ITEMS = [
  {
    key: "Home",
    label: "Home",
    sublabel: "Browse the collection",
    Icon: Home,
  },
  {
    key: "Favorites",
    label: "My Favorites",
    sublabel: "Your saved pieces",
    Icon: Heart,
  },
  {
    key: "Stores",
    label: "Nearby Stores",
    sublabel: "Find stores near you",
    Icon: MapPin,
  },
];

export default function QuickNavSheet({ visible, onClose, navigation }) {
  const slideY = useRef(new Animated.Value(280)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(slideY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          mass: 0.8,
          stiffness: 160,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: 280,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideY, backdropOpacity]);

  const handleNav = (key) => {
    onClose();
    // Navigate from stack Detail screen back to a tab
    navigation.navigate("Main", { screen: key });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideY }] }]}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>NAVIGATE TO</Text>
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
            <X size={16} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Nav items */}
        {NAV_ITEMS.map(({ key, label, sublabel, Icon }) => (
          <Pressable
            key={key}
            onPress={() => handleNav(key)}
            style={({ pressed }) => [
              styles.navItem,
              pressed && styles.navItemPressed,
            ]}
          >
            <View style={styles.iconWrap}>
              <Icon size={20} color={Colors.accent} />
            </View>
            <View style={styles.navText}>
              <Text style={styles.navLabel}>{label}</Text>
              <Text style={styles.navSublabel}>{sublabel}</Text>
            </View>
          </Pressable>
        ))}

        <View style={{ height: Spacing.xl }} />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    ...Shadows.sheet,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: Spacing.base,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.base,
  },
  sheetTitle: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    letterSpacing: Typography.letterSpacingWidest,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  navItemPressed: {
    backgroundColor: Colors.accentLight,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navText: { flex: 1 },
  navLabel: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    letterSpacing: Typography.letterSpacingTight,
  },
  navSublabel: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
