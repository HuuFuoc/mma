/**
 * ImagePreviewModal – full-screen image preview with gestures.
 * Built with built-in RN PanResponder (zero extra libraries).
 *
 * Supported gestures:
 *   • Double-tap  → toggle 2.5× zoom / reset
 *   • Pinch       → zoom freely (1× – 4×)
 *   • Drag        → pan image when zoomed in
 *   • Swipe down  → dismiss (when at 1×)
 *   • Close btn   → dismiss anytime
 */
import React, { useRef, useCallback } from "react";
import {
  Modal,
  View,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { X } from "lucide-react-native";
import { Spacing, Radius } from "../theme";

const { width: W, height: H } = Dimensions.get("window");
const MIN_SCALE = 1;
const MAX_SCALE = 4;

function touchDist(touches) {
  const [a, b] = touches;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

export default function ImagePreviewModal({ visible, uri, onClose }) {
  // Animated values
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Mutable refs — avoid stale closures inside PanResponder
  const scaleVal = useRef(1);
  const txVal = useRef(0);
  const tyVal = useRef(0);
  const lastDist = useRef(null);
  const panStartTx = useRef(0);
  const panStartTy = useRef(0);
  const lastTapAt = useRef(0);

  const resetToFit = useCallback(() => {
    scaleVal.current = 1;
    txVal.current = 0;
    tyVal.current = 0;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        damping: 15,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 15,
      }),
    ]).start();
  }, [scale, translateX, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        panStartTx.current = txVal.current;
        panStartTy.current = tyVal.current;
        lastDist.current = touches.length === 2 ? touchDist(touches) : null;

        // Double-tap to toggle 2.5× zoom
        const now = Date.now();
        if (touches.length === 1 && now - lastTapAt.current < 280) {
          if (scaleVal.current > 1) {
            resetToFit();
          } else {
            scaleVal.current = 2.5;
            scale.setValue(2.5);
          }
        }
        lastTapAt.current = now;
      },

      onPanResponderMove: (evt, gs) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          // Pinch-to-zoom
          const d = touchDist(touches);
          if (lastDist.current != null) {
            const ratio = d / lastDist.current;
            const next = Math.min(
              MAX_SCALE,
              Math.max(MIN_SCALE, scaleVal.current * ratio),
            );
            scaleVal.current = next;
            scale.setValue(next);
          }
          lastDist.current = d;
        } else if (touches.length === 1 && scaleVal.current > 1) {
          // Pan when zoomed
          const nx = panStartTx.current + gs.dx;
          const ny = panStartTy.current + gs.dy;
          txVal.current = nx;
          tyVal.current = ny;
          translateX.setValue(nx);
          translateY.setValue(ny);
        }
      },

      onPanResponderRelease: (_, gs) => {
        lastDist.current = null;
        // Swipe down to dismiss when not zoomed
        if (scaleVal.current <= 1.05 && gs.dy > 100 && Math.abs(gs.dx) < 70) {
          onClose();
        } else if (scaleVal.current < 1) {
          resetToFit();
        }
        // Commit pan offset
        txVal.current = panStartTx.current + gs.dx;
        tyVal.current = panStartTy.current + gs.dy;
        panStartTx.current = txVal.current;
        panStartTy.current = tyVal.current;
      },
    }),
  ).current;

  const handleClose = useCallback(() => {
    // Reset all transforms before closing
    scaleVal.current = 1;
    txVal.current = 0;
    tyVal.current = 0;
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    onClose();
  }, [onClose, scale, translateX, translateY]);

  if (!uri) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <View style={styles.container} {...panResponder.panHandlers}>
        <Animated.Image
          source={{ uri }}
          style={[
            styles.image,
            {
              transform: [{ scale }, { translateX }, { translateY }],
            },
          ]}
          resizeMode="contain"
        />
        <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={12}>
          <X size={22} color="#fff" />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: W,
    height: H,
  },
  closeBtn: {
    position: "absolute",
    top: 52,
    right: Spacing.base,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
});
