import React, { useMemo, useContext, useState, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, Chip, Divider, Surface, Card } from "react-native-paper";
import { Heart, ChevronLeft, LayoutGrid } from "lucide-react-native";
import FavoritesContext from "../context/FavoritesContext";
import Stars from "../components/Stars";
import FilterChip from "../components/FilterChip";
import BottomCTABar from "../components/BottomCTABar";
import QuickNavSheet from "../components/QuickNavSheet";
import ReviewItem from "../components/ReviewItem";
import { MOCK_REVIEWS } from "../mocks/reviews";
import { formatPercentOff, getCostNumber } from "../utils/handbag";
import { Colors, Spacing, Radius, Shadows, Typography } from "../theme";

function DetailScreen({ route, navigation }) {
  const fav = useContext(FavoritesContext);
  const item = route?.params?.item;
  const id = String(item?.id || "");
  const favorite = fav?.isFavorite?.(id);
  const [filterMode, setFilterMode] = useState("all");
  const [navSheetVisible, setNavSheetVisible] = useState(false);

  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const IMAGE_H = Dimensions.get("window").width * (4 / 3);

  const topBarBg = scrollY.interpolate({
    inputRange: [0, IMAGE_H * 0.55],
    outputRange: ["rgba(254,250,224,0)", "rgba(254,250,224,1)"],
    extrapolate: "clamp",
  });
  const topBarBorderOpacity = scrollY.interpolate({
    inputRange: [IMAGE_H * 0.48, IMAGE_H * 0.65],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const titleOpacity = scrollY.interpolate({
    inputRange: [IMAGE_H * 0.42, IMAGE_H * 0.65],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const feedback = useMemo(() => {
    const list = Array.isArray(item?.feedback) ? item.feedback : [];
    const normalized = list
      .map((f) => ({
        rating: Math.max(1, Math.min(5, Math.round(Number(f?.rating) || 0))),
        comment: String(f?.comment || "").trim(),
      }))
      .filter((f) => f.rating && f.comment);
    const groups = new Map();
    for (let i = 1; i <= 5; i++) groups.set(i, []);
    normalized.forEach((f) => groups.get(f.rating).push(f));
    return {
      total: normalized.length,
      groups,
      list: normalized,
      avg:
        normalized.length === 0
          ? 0
          : normalized.reduce((s, f) => s + f.rating, 0) / normalized.length,
    };
  }, [item]);

  // Use real feedback when available, fall back to MOCK_REVIEWS for the list
  const displayReviews = useMemo(() => {
    if (feedback.total > 0) {
      return feedback.list.map((f, i) => ({
        id: `real-${i}`,
        userName: "Verified Customer",
        rating: f.rating,
        comment: f.comment,
        createdAt: new Date().toISOString().split("T")[0],
        verifiedPurchase: true,
      }));
    }
    return MOCK_REVIEWS;
  }, [feedback]);

  // Summary stats: prefer real feedback, fall back to mock
  const reviewStats = useMemo(() => {
    const source = feedback.total > 0 ? feedback.list : MOCK_REVIEWS;
    const total = source.length;
    const avg =
      total === 0 ? 0 : source.reduce((s, r) => s + (r.rating || 0), 0) / total;
    const groups = new Map();
    for (let i = 1; i <= 5; i++) groups.set(i, []);
    source.forEach((r) => groups.get(Math.round(r.rating))?.push(r));
    return { total, avg, groups };
  }, [feedback]);

  // countsByRating: { 5: n, 4: n, 3: n, 2: n, 1: n }
  const countsByRating = useMemo(() => {
    const map = {};
    for (let i = 1; i <= 5; i++) {
      map[i] = reviewStats.groups.get(i)?.length || 0;
    }
    return map;
  }, [reviewStats.groups]);

  const visibleReviews = useMemo(() => {
    if (filterMode === "all") return displayReviews;
    return displayReviews.filter((r) => r.rating === Number(filterMode));
  }, [displayReviews, filterMode]);

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
      >
        {/* ─ Image hero ─────────────────────────────────────────── */}
        <View style={styles.imageContainer}>
          {item?.uri ? (
            <Image
              source={{ uri: item.uri }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImagePlaceholder}>
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
        </View>

        {/* ─ Product header card ────────────────────────────────── */}
        <View style={styles.headerCard}>
          {/* Brand eyebrow */}
          <Text style={styles.brandEyebrow}>
            {(item?.brand || "Unknown Brand").toUpperCase()}
          </Text>

          {/* Product name */}
          <Text style={styles.productName}>
            {item?.handbagName || item?.name || "Unnamed Product"}
          </Text>

          {/* Category tag + rating in one row */}
          <View style={styles.metaRow}>
            {item?.category ? (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{item.category}</Text>
              </View>
            ) : null}
            {reviewStats.total > 0 ? (
              <View style={styles.ratingPill}>
                <Stars value={reviewStats.avg} size={13} />
                <Text style={styles.ratingCount}>({reviewStats.total})</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ─ Product Details card ───────────────────────────────── */}
        <Surface style={styles.detailsCard} elevation={0}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Divider style={styles.divider} />

          {[
            { label: "Brand", value: item?.brand || "N/A" },
            item?.category ? { label: "Category", value: item.category } : null,
            item?.gender !== undefined
              ? {
                  label: "Gender",
                  value: item.gender === true ? "Women" : "Men",
                }
              : null,
          ]
            .filter(Boolean)
            .map((row) => (
              <View key={row.label} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue}>{row.value}</Text>
              </View>
            ))}

          {item?.color && Array.isArray(item.color) && item.color.length > 0 ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Color</Text>
              <View style={styles.colorRow}>
                {item.color.map((c, idx) => (
                  <View key={idx} style={styles.colorTag}>
                    <Text style={styles.colorTagText}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {item?.description ? (
            <>
              <Text
                style={[
                  styles.detailLabel,
                  { marginTop: Spacing.md, marginBottom: Spacing.sm },
                ]}
              >
                Description
              </Text>
              <Text style={styles.description}>{String(item.description)}</Text>
            </>
          ) : null}
        </Surface>

        {/* ─ Reviews card ───────────────────────────────────────── */}
        <Surface style={styles.reviewsCard} elevation={0}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <Divider style={styles.divider} />

          {/* Rating overview */}
          <View style={styles.ratingOverview}>
            <View style={styles.avgRatingBox}>
              <Text style={styles.avgRatingNumber}>
                {reviewStats.avg.toFixed(1)}
              </Text>
              <Stars value={reviewStats.avg} size={22} />
              <Text style={styles.totalReviews}>
                {reviewStats.total}{" "}
                {reviewStats.total === 1 ? "review" : "reviews"}
              </Text>
            </View>
            <View style={styles.ratingBreakdown}>
              {[5, 4, 3, 2, 1].map((v) => {
                const count = reviewStats.groups.get(v)?.length || 0;
                const pct =
                  feedback.total === 0 ? 0 : (count / feedback.total) * 100;
                return (
                  <View key={v} style={styles.ratingRow}>
                    <Text style={styles.starLabel}>{v}★</Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[styles.progressFill, { width: `${pct}%` }]}
                      />
                    </View>
                    <Text style={styles.countLabel}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Rating filter chips — All / 5★ / 4★ / 3★ / 2★ / 1★ */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {[
              { label: `All (${reviewStats.total})`, value: "all" },
              { label: `5★ (${countsByRating[5]})`, value: "5" },
              { label: `4★ (${countsByRating[4]})`, value: "4" },
              { label: `3★ (${countsByRating[3]})`, value: "3" },
              { label: `2★ (${countsByRating[2]})`, value: "2" },
              { label: `1★ (${countsByRating[1]})`, value: "1" },
            ].map((f) => (
              <FilterChip
                key={f.value}
                label={f.label}
                active={filterMode === f.value}
                onPress={() => setFilterMode(f.value)}
              />
            ))}
          </ScrollView>

          {/* Review list */}
          <View style={styles.commentsContainer}>
            {visibleReviews.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No reviews yet</Text>
              </View>
            ) : (
              visibleReviews.map((r) => <ReviewItem key={r.id} review={r} />)
            )}
          </View>

          {/* Write a Review CTA */}
          <Pressable
            onPress={() => {
              /* TODO: implement review form */
            }}
            style={({ pressed }) => [
              styles.writeReviewBtn,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.writeReviewText}>✦ Write a Review</Text>
          </Pressable>
        </Surface>

        {/* Bottom spacer so content is not hidden behind sticky bar */}
        <View style={{ height: 96 + insets.bottom }} />
      </Animated.ScrollView>

      {/* ─ DetailTopBar — absolute luxury overlay ─────────────────── */}
      <Animated.View
        style={[
          styles.topBar,
          { paddingTop: insets.top, backgroundColor: topBarBg },
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[styles.topBarDivider, { opacity: topBarBorderOpacity }]}
        />
        <View style={styles.topBarInner}>
          {/* Back */}
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={({ pressed }) => [
              styles.topBarBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <ChevronLeft size={22} color={Colors.textPrimary} />
          </Pressable>

          {/* Center title — fades in after scrolling past image */}
          <Animated.Text
            style={[styles.topBarTitle, { opacity: titleOpacity }]}
          >
            Product Details
          </Animated.Text>

          {/* Right cluster: heart + quick-nav */}
          <View style={styles.topBarRight}>
            <Pressable
              onPress={() => {
                if (!id) return;
                if (favorite) fav.removeFavorite(id);
                else fav.addFavorite(id);
              }}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              style={({ pressed }) => [
                styles.topBarBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Heart
                size={20}
                color={favorite ? Colors.wishlist : Colors.textPrimary}
                fill={favorite ? Colors.wishlist : "transparent"}
              />
            </Pressable>
            <Pressable
              onPress={() => setNavSheetVisible(true)}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 12 }}
              style={({ pressed }) => [
                styles.topBarBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <LayoutGrid size={20} color={Colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* ─ Sticky bottom CTA ──────────────────────────────────────── */}
      <BottomCTABar
        price={getCostNumber(item)}
        percentOff={item?.percentOff ? formatPercentOff(item.percentOff) : null}
        onAddToBag={() => {
          // TODO: wire to cart / bag context
        }}
      />

      {/* ─ Quick navigation sheet ─────────────────────────────────── */}
      <QuickNavSheet
        visible={navSheetVisible}
        onClose={() => setNavSheetVisible(false)}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Root wrapper (holds SafeArea + sticky bar)
  root: { flex: 1, backgroundColor: Colors.background },
  screen: { flex: 1 },
  content: { paddingBottom: Spacing.base },

  // ─ Image hero ──────────────────────────────────────────────────
  imageContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: Colors.imagePlaceholder,
    marginBottom: Spacing.base,
  },
  productImage: { width: "100%", height: "100%" },
  noImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surfaceSubtle,
  },
  noImageText: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textDisabled,
  },
  // ─ DetailTopBar ──────────────────────────────────────────────────────────
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBarDivider: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(31,31,31,0.14)",
  },
  topBarInner: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  topBarTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    letterSpacing: 0.6,
  },
  topBarBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: "rgba(254,250,224,0.85)",
    borderWidth: 1,
    borderColor: "rgba(31,31,31,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarRight: {
    flexDirection: "row",
    gap: Spacing.sm,
  },

  // ─ Header card (below image, no elevation) ─────────────────────
  headerCard: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    gap: Spacing.sm,
  },
  brandEyebrow: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    letterSpacing: Typography.letterSpacingWidest,
  },
  productName: {
    fontSize: Typography.fontSizeXXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeightTitle,
    letterSpacing: Typography.letterSpacingTight,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  categoryTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.chip,
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  categoryTagText: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.accent,
    letterSpacing: Typography.letterSpacingWide,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingCount: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textSecondary,
  },

  // ─ Details card ────────────────────────────────────────────────
  detailsCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    padding: Spacing.base,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    letterSpacing: Typography.letterSpacingWidest,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  divider: {
    marginVertical: Spacing.md,
    backgroundColor: Colors.divider,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  detailLabel: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textPrimary,
    flex: 2,
    textAlign: "right",
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 2,
    justifyContent: "flex-end",
  },
  colorTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.chip,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorTagText: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textOnSurface,
    fontWeight: Typography.fontWeightMedium,
  },
  description: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeightBody,
  },

  // ─ Reviews card ────────────────────────────────────────────────
  reviewsCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    padding: Spacing.base,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ratingOverview: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  avgRatingBox: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  avgRatingNumber: {
    fontSize: Typography.fontSizeDisplay,
    fontWeight: Typography.fontWeightBold,
    color: Colors.accent,
    letterSpacing: Typography.letterSpacingTight,
    marginBottom: Spacing.xs,
  },
  totalReviews: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    letterSpacing: Typography.letterSpacingWide,
  },
  ratingBreakdown: { flex: 2, gap: 6 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  starLabel: {
    width: 28,
    fontSize: Typography.fontSizeSM,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeightMedium,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
  },
  countLabel: {
    width: 24,
    textAlign: "right",
    fontSize: Typography.fontSizeXS,
    color: Colors.textSecondary,
  },

  filterRow: { gap: Spacing.sm, paddingVertical: Spacing.md },

  commentsContainer: { marginTop: Spacing.sm, gap: Spacing.md },
  commentCard: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  commentText: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeightBody,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textDisabled,
  },

  // ─ Write a Review CTA ─────────────────────────────────────────
  writeReviewBtn: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.input,
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: "center",
  },
  writeReviewText: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.accent,
    letterSpacing: Typography.letterSpacingWide,
  },
});

export default DetailScreen;
