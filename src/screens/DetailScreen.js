import React, { useMemo, useContext, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Card,
  Chip,
  IconButton,
  Divider,
  Surface,
  Button,
  Badge,
} from "react-native-paper";
import { Heart, Home, Star } from "lucide-react-native";
import FavoritesContext from "../context/FavoritesContext";
import Stars from "../components/Stars";
import { formatPercentOff, getCostNumber } from "../utils/handbag";

function DetailScreen({ route, navigation }) {
  const fav = useContext(FavoritesContext);
  const item = route?.params?.item;
  const id = String(item?.id || "");
  const favorite = fav?.isFavorite?.(id);
  const [filterMode, setFilterMode] = useState("all");

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

  const visibleComments = useMemo(() => {
    if (filterMode === "all") return feedback.list;
    if (filterMode === "negative")
      return feedback.list.filter((f) => f.rating <= 2);
    if (filterMode === "1") return feedback.list.filter((f) => f.rating === 1);
    if (filterMode === "2") return feedback.list.filter((f) => f.rating === 2);
    return feedback.list;
  }, [feedback.list, filterMode]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {item?.uri ? (
            <Image
              source={{ uri: item.uri }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImagePlaceholder}>
              <Text variant="bodyLarge" style={styles.noImageText}>
                No Image Available
              </Text>
            </View>
          )}
        </View>

        {/* Product Header */}
        <Surface style={styles.headerCard} elevation={2}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text variant="headlineSmall" style={styles.title}>
                {item?.handbagName || item?.name || "Unnamed Product"}
              </Text>
              <Text variant="titleMedium" style={styles.brand}>
                {item?.brand || "Unknown Brand"}
              </Text>
              {item?.category ? (
                <Chip
                  mode="outlined"
                  style={styles.categoryChip}
                  textStyle={styles.categoryChipText}
                >
                  {item.category}
                </Chip>
              ) : null}
            </View>
            <View style={styles.iconGroup}>
              <IconButton
                icon={() => <Home size={22} color="#757575" />}
                size={22}
                onPress={() => navigation.navigate("Main", { screen: "Home" })}
                style={styles.navIconButton}
                containerColor="#F5F5F5"
              />
              <IconButton
                icon={() => <Star size={22} color="#757575" />}
                size={22}
                onPress={() =>
                  navigation.navigate("Main", { screen: "Favorites" })
                }
                style={styles.navIconButton}
                containerColor="#F5F5F5"
              />
              <IconButton
                icon={() => (
                  <Heart
                    size={24}
                    color={favorite ? "#FF6B6B" : "#9CA3AF"}
                    fill={favorite ? "#FF6B6B" : "transparent"}
                  />
                )}
                size={24}
                onPress={() => {
                  if (!id) return;
                  if (favorite) fav.removeFavorite(id);
                  else fav.addFavorite(id);
                }}
                style={styles.favIconButton}
                containerColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text variant="headlineMedium" style={styles.price}>
              ${getCostNumber(item)}
            </Text>
            {item?.percentOff ? (
              <Badge size={28} style={styles.discountBadge}>
                -{formatPercentOff(item.percentOff)} OFF
              </Badge>
            ) : null}
          </View>
        </Surface>

        {/* Product Details */}
        <Surface style={styles.detailsCard} elevation={1}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Product Details
          </Text>
          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text variant="bodyLarge" style={styles.detailLabel}>
              Brand:
            </Text>
            <Text variant="bodyLarge" style={styles.detailValue}>
              {item?.brand || "N/A"}
            </Text>
          </View>

          {item?.category ? (
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.detailLabel}>
                Category:
              </Text>
              <Text variant="bodyLarge" style={styles.detailValue}>
                {item.category}
              </Text>
            </View>
          ) : null}

          {item?.color && Array.isArray(item.color) && item.color.length > 0 ? (
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.detailLabel}>
                Color:
              </Text>
              <View style={styles.colorContainer}>
                {item.color.map((c, idx) => (
                  <Chip key={idx} mode="outlined" style={styles.colorChip}>
                    {c}
                  </Chip>
                ))}
              </View>
            </View>
          ) : null}

          {item?.gender !== undefined ? (
            <View style={styles.detailRow}>
              <Text variant="bodyLarge" style={styles.detailLabel}>
                Gender:
              </Text>
              <Text variant="bodyLarge" style={styles.detailValue}>
                {item.gender === true ? "Nữ" : "Nam"}
              </Text>
            </View>
          ) : null}

          {item?.description ? (
            <>
              <Text
                variant="bodyLarge"
                style={[styles.detailLabel, { marginTop: 12, marginBottom: 8 }]}
              >
                Description:
              </Text>
              <Text variant="bodyMedium" style={styles.description}>
                {String(item.description)}
              </Text>
            </>
          ) : null}
        </Surface>

        {/* Reviews Section */}
        <Surface style={styles.reviewsCard} elevation={1}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Customer Reviews
          </Text>
          <Divider style={styles.divider} />

          {/* Average Rating */}
          <View style={styles.ratingOverview}>
            <View style={styles.avgRatingBox}>
              <Text variant="displaySmall" style={styles.avgRatingNumber}>
                {feedback.avg.toFixed(1)}
              </Text>
              <Stars value={feedback.avg} size={24} />
              <Text variant="bodyMedium" style={styles.totalReviews}>
                {feedback.total} {feedback.total === 1 ? "review" : "reviews"}
              </Text>
            </View>

            {/* Rating Breakdown */}
            <View style={styles.ratingBreakdown}>
              {[5, 4, 3, 2, 1].map((v) => {
                const count = feedback.groups.get(v)?.length || 0;
                const percentage =
                  feedback.total === 0 ? 0 : (count / feedback.total) * 100;
                return (
                  <View key={v} style={styles.ratingRow}>
                    <Text variant="bodyMedium" style={styles.starLabel}>
                      {v}★
                    </Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${percentage}%` },
                        ]}
                      />
                    </View>
                    <Text variant="bodySmall" style={styles.countLabel}>
                      {count}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {[
              { label: "Tất cả", value: "all" },
              { label: "Tiêu cực (≤2⭐)", value: "negative" },
              { label: "1⭐", value: "1" },
              { label: "2⭐", value: "2" },
            ].map((filter) => {
              const active = filterMode === filter.value;
              return (
                <Chip
                  key={filter.value}
                  selected={active}
                  onPress={() => setFilterMode(filter.value)}
                  mode={active ? "flat" : "outlined"}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  textStyle={{
                    fontWeight: active ? "bold" : "normal",
                    color: active ? "#FFFFFF" : "#424242",
                  }}
                >
                  {filter.label}
                </Chip>
              );
            })}
          </ScrollView>

          {/* Comments */}
          <View style={styles.commentsContainer}>
            {visibleComments.length === 0 ? (
              <Surface style={styles.emptyState} elevation={0}>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  {filterMode === "all"
                    ? "No reviews yet"
                    : "No reviews match this filter"}
                </Text>
              </Surface>
            ) : (
              visibleComments.map((f, idx) => (
                <Card key={idx} style={styles.commentCard} elevation={1}>
                  <Card.Content>
                    <Stars value={f.rating} size={18} />
                    <Text variant="bodyMedium" style={styles.commentText}>
                      {f.comment}
                    </Text>
                  </Card.Content>
                </Card>
              ))
            )}
          </View>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  navButton: {
    margin: 0,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  imageContainer: {
    width: "100%",
    height: 384,
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 16,
    marginBottom: 16,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  noImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#9CA3AF",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  brand: {
    color: "#FF6B6B",
    fontWeight: "600",
    marginBottom: 8,
  },
  categoryChip: {
    alignSelf: "flex-start",
    marginTop: 4,
    backgroundColor: "#FFF3E0",
    borderColor: "#FFB74D",
  },
  categoryChipText: {
    color: "#F57C00",
    fontWeight: "600",
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  navIconButton: {
    margin: 0,
  },
  favIconButton: {
    elevation: 4,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  discountBadge: {
    backgroundColor: "#D32F2F",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: "#E5E7EB",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontWeight: "600",
    color: "#424242",
    flex: 1,
  },
  detailValue: {
    color: "#1A1A1A",
    flex: 2,
    textAlign: "right",
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 2,
    justifyContent: "flex-end",
  },
  colorChip: {
    height: 32,
    backgroundColor: "#F5F5F5",
  },
  description: {
    color: "#424242",
    lineHeight: 22,
  },
  reviewsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  ratingOverview: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  avgRatingBox: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  avgRatingNumber: {
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 8,
  },
  totalReviews: {
    color: "#757575",
    marginTop: 8,
  },
  ratingBreakdown: {
    flex: 2,
    gap: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starLabel: {
    width: 30,
    color: "#424242",
    fontWeight: "600",
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6B6B",
    borderRadius: 4,
  },
  countLabel: {
    width: 30,
    textAlign: "right",
    color: "#757575",
  },
  filterContainer: {
    gap: 8,
    paddingVertical: 12,
  },
  filterChip: {
    backgroundColor: "#FFFFFF",
  },
  filterChipActive: {
    backgroundColor: "#FF6B6B",
  },
  commentsContainer: {
    marginTop: 12,
    gap: 12,
  },
  commentCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
  },
  commentText: {
    marginTop: 8,
    color: "#424242",
    lineHeight: 20,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  emptyText: {
    color: "#9CA3AF",
  },
});

export default DetailScreen;
