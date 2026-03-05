/**
 * ReviewItem – luxury review card.
 * Shows avatar initials, verified-purchase badge, star rating, date,
 * and comment with optional "Read more / Show less" toggle.
 */
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Stars from "./Stars";
import { Colors, Spacing, Radius, Typography } from "../theme";

const COLLAPSE_LINES = 3;
const LONG_THRESHOLD = 120;

export default function ReviewItem({ review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = (review?.comment?.length || 0) > LONG_THRESHOLD;

  const initials = (review?.userName || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();

  const dateStr = review?.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <View style={styles.card}>
      {/* Top row: avatar + name + rating */}
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.metaBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {review?.userName}
            </Text>
            {review?.verifiedPurchase && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.ratingRow}>
            <Stars value={review?.rating ?? 0} size={13} />
            {dateStr ? <Text style={styles.dateTxt}>{dateStr}</Text> : null}
          </View>
        </View>
      </View>

      {/* Comment body */}
      <Text
        style={styles.comment}
        numberOfLines={expanded ? undefined : COLLAPSE_LINES}
      >
        {review?.comment}
      </Text>

      {/* Read more toggle */}
      {isLong && (
        <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={8}>
          <Text style={styles.readMore}>
            {expanded ? "Show less ↑" : "Read more ↓"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textOnSurface,
    letterSpacing: Typography.letterSpacingWide,
  },
  metaBlock: { flex: 1, gap: 3 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  userName: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  verifiedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.accent,
    letterSpacing: 0.3,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dateTxt: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textDisabled,
  },
  comment: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeightBody,
  },
  readMore: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.accent,
    letterSpacing: Typography.letterSpacingWide,
    marginTop: 2,
  },
});
