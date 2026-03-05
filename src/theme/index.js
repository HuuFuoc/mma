/**
 * Luxury Design Tokens – complete theme for the Handbag App
 *
 * Usage:
 *   import { Colors, Spacing, Radius, Typography, PaperTheme } from '../theme';
 *
 *   // In App.js  →  <PaperProvider theme={PaperTheme}>
 *   // In styles  →  backgroundColor: Colors.background
 */

import { MD3LightTheme } from "react-native-paper";
import { Colors } from "./colors";

// ─── Spacing scale (px) ──────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// ─── Border-radius scale ─────────────────────────────────────────────────────
export const Radius = {
  xs: 6,
  sm: 8,
  md: 12,
  /** Input fields, search bars */
  input: 16,
  /** Chips / tags */
  chip: 14,
  /** Default card */
  card: 20,
  lg: 24,
  full: 9999,
};

// ─── Typography ──────────────────────────────────────────────────────────────
export const Typography = {
  // Font sizes
  fontSizeXS: 11,
  fontSizeSM: 13,
  fontSizeMD: 15,
  fontSizeLG: 18,
  fontSizeXL: 22,
  fontSizeXXL: 28,
  fontSizeDisplay: 36,

  // Font weights (string union for RN StyleSheet)
  fontWeightRegular: "400",
  fontWeightMedium: "500",
  fontWeightSemiBold: "600",
  fontWeightBold: "700",

  // Line heights
  lineHeightXS: 16,
  lineHeightSM: 18,
  lineHeightBody: 22,
  lineHeightTitle: 28,
  lineHeightDisplay: 40,

  // Letter spacing — slightly open for luxury feel
  letterSpacingTight: -0.3,
  letterSpacingNormal: 0,
  letterSpacingWide: 0.4,
  /** All-caps labels, section titles */
  letterSpacingWidest: 1.2,
};

// ─── Shadow presets ──────────────────────────────────────────────────────────────
export const Shadows = {
  /** Almost-invisible card shadow for luxury look */
  card: {
    shadowColor: "rgba(31,31,31,1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  /** Sticky bottom bar / modal */
  sheet: {
    shadowColor: "rgba(31,31,31,1)",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 8,
  },
};

// ─── React Native Paper MD3 Theme ────────────────────────────────────────────
/**
 * Pass this to <PaperProvider theme={PaperTheme}>.
 * All Paper components will automatically inherit accent / surface / error.
 */
export const PaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,

    // Core
    primary: Colors.accent, // Camel Tan
    primaryContainer: Colors.accentLight,
    onPrimary: Colors.textOnAccent,

    secondary: Colors.surface, // Soft Sage
    secondaryContainer: Colors.surfaceSubtle,
    onSecondary: Colors.textOnSurface,

    // Backgrounds
    background: Colors.background, // Ivory
    surface: Colors.card,
    surfaceVariant: Colors.surface, // Sage (chips use this)

    // Text
    onBackground: Colors.textPrimary,
    onSurface: Colors.textPrimary,
    onSurfaceVariant: Colors.textOnSurface,

    // Error
    error: Colors.error,
    errorContainer: Colors.errorContainer,

    // Borders
    outline: Colors.border,
    outlineVariant: Colors.divider,
  },
};

// ─── Component-level mapping reference ──────────────────────────────────────
/**
 * BUTTON
 *   Primary (CTA):   bg=accent,        text=textOnAccent
 *   Secondary:       bg=surface,       text=textOnSurface, border=border
 *   Ghost:           bg=accentLight,   text=accent,        border=accent
 *   Pressed:         opacity 0.85 over base bg
 *   Disabled:        bg=disabled,      text=textDisabled
 *
 * CARD
 *   background:  Colors.card
 *   border:      Colors.border  (width 1)
 *   shadow:      rgba(31,31,31,0.06) / elevation 2
 *
 * INPUT
 *   border:         Colors.border
 *   border (focus): Colors.borderFocus  (#D4A373)
 *   placeholder:    Colors.textDisabled
 *   background:     Colors.card
 *
 * TAB BAR
 *   background:     Colors.background
 *   activeTint:     Colors.accent
 *   inactiveTint:   Colors.textSecondary
 *
 * CHIP / TAG
 *   default:   bg=surfaceSubtle  text=textOnSurface  border=border
 *   active:    bg=accent         text=textOnAccent
 *
 * BADGE
 *   discount:  bg=accent         text=textOnAccent
 *   count:     bg=surface        text=textOnSurface  border=accent
 *
 * STAR RATING
 *   filled:    Colors.starActive   (#D4A373)
 *   empty:     Colors.starInactive (#D8D5C8)
 *
 * WISHLIST HEART
 *   active:    Colors.wishlist   (#D4A373)
 *   inactive:  Colors.textDisabled
 */

export { Colors };
export default PaperTheme;
