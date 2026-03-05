/**
 * SwipeableItem – swipe left to reveal a Delete action.
 * Built with built-in RN PanResponder (no gesture-handler required).
 *
 * Props:
 *   children   – the card/row content
 *   onDelete   – called after the delete button is tapped (after snap-back)
 *   disabled   – pass `true` in selection mode to prevent swipe conflict
 *
 * Ref API:
 *   ref.current.close() – programmatically snap back to 0
 */
import React, { useRef, useCallback } from "react";
import {
  View,
  Animated,
  PanResponder,
  Pressable,
  Text,
  StyleSheet,
} from "react-native";
import { Trash2 } from "lucide-react-native";
import { Colors, Spacing, Radius, Typography } from "../theme";

const DELETE_W = 80; // width of the revealed delete zone
const OPEN_THRESHOLD = -50; // dx threshold to snap open

const SwipeableItem = React.forwardRef(function SwipeableItem(
  { children, onDelete, disabled },
  ref,
) {
  const tx = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const snap = useCallback(
    (toValue, cb) => {
      Animated.spring(tx, {
        toValue,
        useNativeDriver: true,
        damping: 22,
        mass: 0.9,
        stiffness: 200,
      }).start(cb);
      isOpen.current = toValue < 0;
    },
    [tx],
  );

  // Expose close() via ref
  React.useImperativeHandle(ref, () => ({ close: () => snap(0) }), [snap]);

  const panResponder = useRef(
    PanResponder.create({
      // Only claim the gesture when motion is clearly horizontal
      onMoveShouldSetPanResponder: (_, gs) =>
        !disabled &&
        Math.abs(gs.dx) > 8 &&
        Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,

      onPanResponderMove: (_, gs) => {
        if (disabled) return;
        const base = isOpen.current ? -DELETE_W : 0;
        // Allow a tiny positive "bounce" (+8) but clamp at -DELETE_W
        const next = Math.min(8, Math.max(-DELETE_W, base + gs.dx));
        tx.setValue(next);
      },

      onPanResponderRelease: (_, gs) => {
        if (disabled) return;
        const base = isOpen.current ? -DELETE_W : 0;
        if (base + gs.dx < OPEN_THRESHOLD) {
          snap(-DELETE_W);
        } else {
          snap(0);
        }
      },
    }),
  ).current;

  return (
    <View style={styles.wrapper}>
      {/* Delete zone revealed underneath the sliding content */}
      <View style={styles.deleteZone}>
        <Pressable
          onPress={() => snap(0, () => onDelete?.())}
          style={styles.deleteBtn}
        >
          <Trash2 size={20} color="#fff" />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </Pressable>
      </View>

      {/* Sliding content */}
      <Animated.View
        style={[styles.content, { transform: [{ translateX: tx }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
});

export default SwipeableItem;

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  deleteZone: {
    position: "absolute",
    top: 0,
    bottom: Spacing.md, // matches the card's marginBottom so it doesn't overextend
    right: 0,
    width: DELETE_W,
    borderTopRightRadius: Radius.card,
    borderBottomRightRadius: Radius.card,
    overflow: "hidden",
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  deleteBtnText: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
    color: "#fff",
    letterSpacing: Typography.letterSpacingWide,
  },
  content: {
    // No background here — the child card supplies its own
  },
});
