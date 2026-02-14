import React from "react";
import { View, Text } from "react-native";

function Stars({ value, size = 16 }) {
  const v = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return (
    <View style={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text
          key={i}
          style={{ fontSize: size, color: i < v ? "#F59E0B" : "#D1D5DB" }}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

export default Stars;
