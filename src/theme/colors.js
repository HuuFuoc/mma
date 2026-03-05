/**
 * LUXURY BRAND PALETTE – Handbag App
 * Ratio: 70 % Background · 20 % Surface/Sage · 10 % Accent/Tan
 *
 * #FEFAE0  Ivory        — backgrounds (70 %)
 * #CCD5AE  Soft Sage    — surface / chip / tab fill (20 %)
 * #D4A373  Camel Tan    — CTA / active state / badge (10 %)
 */

export const Colors = {
  // ─── Background (70 %) ─────────────────────────────────────────────────────
  /** Primary screen background */
  background: "#FEFAE0",
  /** Card / bottom-sheet surface — barely warmer than background */
  card: "#FFFDF5",
  /** Image placeholder / skeleton */
  imagePlaceholder: "#EDE8D6",

  // ─── Surface / Chip / Tag / Tab (20 %) ─────────────────────────────────────
  /** Soft Sage — chips, selected tab bg, toolbars, badge fills */
  surface: "#CCD5AE",
  /** Lighter sage — progress tracks, dividers, unselected chip bg */
  surfaceSubtle: "#E2E8D0",

  // ─── Accent / CTA (10 %) ───────────────────────────────────────────────────
  /** Camel Tan — CTA buttons, active tab icon, badge, price highlight */
  accent: "#D4A373",
  /** Translucent accent — ghost button fill, pressed overlay */
  accentLight: "rgba(212,163,115,0.15)",

  // ─── Text ──────────────────────────────────────────────────────────────────
  /** Primary headings & body — near-black */
  textPrimary: "#1F1F1F",
  /** Secondary labels, captions, meta */
  textSecondary: "#5A5A5A",
  /** Disabled / placeholder text */
  textDisabled: "#A8A8A8",
  /** Text rendered ON accent or dark surfaces — ivory */
  textOnAccent: "#FEFAE0",
  /** Text rendered ON sage surface */
  textOnSurface: "#3A3A3A",

  // ─── Border / Divider ──────────────────────────────────────────────────────
  /** Default border (alpha so it works on any bg) */
  border: "rgba(31,31,31,0.10)",
  /** Input focus ring */
  borderFocus: "#D4A373",
  /** Lightweight divider line */
  divider: "rgba(31,31,31,0.07)",

  // ─── States ───────────────────────────────────────────────────────────────
  disabled: "rgba(204,213,174,0.50)",
  overlay: "rgba(31,31,31,0.40)",
  /** 25 % scrim for image overlays / modals */
  scrim: "rgba(0,0,0,0.25)",
  /** Pressed ripple overlay */
  pressedOverlay: "rgba(31,31,31,0.06)",

  // ─── Semantic: Error ──────────────────────────────────────────────────────
  /** Deep burgundy — premium take on error red */
  error: "#8B2635",
  errorContainer: "rgba(139,38,53,0.09)",
  errorText: "#8B2635",

  // ─── Star / Rating ────────────────────────────────────────────────────────
  starActive: "#D4A373",
  starInactive: "#D8D5C8",

  // ─── Wishlist / Heart ─────────────────────────────────────────────────────
  /** Heart / saved icon active color */
  wishlist: "#D4A373",
};
