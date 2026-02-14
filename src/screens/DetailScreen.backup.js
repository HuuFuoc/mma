import React, { useMemo, useContext, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Card,
  Chip,
  IconButton,
  Divider,
  Surface,
  List,
} from "react-native-paper";
import { Home, Star, Heart } from "lucide-react-native";
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
        {item?.uri ? (
          <Image
            source={{ uri: item.uri }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : null}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginTop: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {item?.handbagName || item?.name || "Unnamed"}
            </Text>
            <Text style={styles.cardSub}>{item?.brand || "Unknown brand"}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => navigation.navigate("Main", { screen: "Home" })}
              style={styles.iconBtn}
            >
              <Text style={styles.iconBtnText}>🏠</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                navigation.navigate("Main", { screen: "Favorites" })
              }
              style={styles.iconBtn}
            >
              <Text style={styles.iconBtnText}>⭐</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (!id) return;
                if (favorite) fav.removeFavorite(id);
                else fav.addFavorite(id);
              }}
              style={[styles.favBtn, favorite && styles.favBtnActive]}
            >
              <Text
                style={[styles.favBtnText, favorite && styles.favBtnTextActive]}
              >
                {favorite ? "♥" : "♡"}
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Info</Text>
          <Text style={styles.row}>- Cost: ${getCostNumber(item)}</Text>
          {item?.percentOff !== undefined ? (
            <Text style={styles.row}>
              - Percent off: {formatPercentOff(item?.percentOff) || "N/A"}
            </Text>
          ) : null}
          {item?.gender !== undefined ? (
            <Text style={styles.row}>
              - Gender: {item.gender === true ? "Nữ" : "Nam"}
            </Text>
          ) : null}
          {item?.description ? (
            <Text style={styles.row}>
              - Description: {String(item.description)}
            </Text>
          ) : null}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={styles.row}>Average rating</Text>
              <Stars value={feedback.avg} size={18} />
              <Text style={styles.muted}>{feedback.total} reviews</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 10 }}
          >
            {[
              { label: "Tất cả", value: "all" },
              { label: "Tiêu cực (1-2⭐)", value: "negative" },
              { label: "1⭐", value: "1" },
              { label: "2⭐", value: "2" },
            ].map((filter) => {
              const active = filterMode === filter.value;
              return (
                <Pressable
                  key={filter.value}
                  onPress={() => setFilterMode(filter.value)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={{ marginTop: 12, gap: 6 }}>
            {[5, 4, 3, 2, 1].map((v) => {
              const count = feedback.groups.get(v)?.length || 0;
              return (
                <View
                  key={v}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Stars value={v} />
                    <Text style={styles.muted}>{v} star</Text>
                  </View>
                  <Text style={styles.muted}>{count}</Text>
                </View>
              );
            })}
          </View>
          <View style={{ marginTop: 14, gap: 10 }}>
            {visibleComments.length === 0 ? (
              <Text style={styles.muted}>
                {filterMode === "all"
                  ? "No comments yet."
                  : "No reviews match this filter."}
              </Text>
            ) : (
              visibleComments.map((f, idx) => (
                <View key={idx} style={styles.commentBox}>
                  <Stars value={f.rating} />
                  <Text style={{ marginTop: 6 }}>{f.comment}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 40 },
  productImage: {
    width: "100%",
    height: 300,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  cardSub: { marginTop: 4, color: "#6B7280" },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignSelf: "flex-start",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  section: {
    marginTop: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  row: { marginTop: 8, color: "#111827" },
  muted: { marginTop: 6, color: "#6B7280" },
  commentBox: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: "#111827", borderColor: "#111827" },
  chipText: { color: "#111827", fontWeight: "600", fontSize: 12 },
  chipTextActive: { color: "#fff" },
  favBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  favBtnActive: { backgroundColor: "#111827", borderColor: "#111827" },
  favBtnText: { fontSize: 20, color: "#111827" },
  favBtnTextActive: { color: "#fff" },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  iconBtnText: { fontSize: 18 },
});

export default DetailScreen;
