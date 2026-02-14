import React, { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FavoritesContext from "./FavoritesContext";

const FAVORITES_KEY = "favorites.handbags.v1";

async function favoritesLoad() {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function favoritesSave(ids) {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ids = await favoritesLoad();
        if (!cancelled) setFavoriteIds(ids);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addFavorite = useCallback(async (id) => {
    setFavoriteIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [id, ...prev];
      favoritesSave(next).catch(() => {});
      return next;
    });
  }, []);

  const removeFavorite = useCallback(async (id) => {
    setFavoriteIds((prev) => {
      const next = prev.filter((x) => x !== id);
      favoritesSave(next).catch(() => {});
      return next;
    });
  }, []);

  const clearFavorites = useCallback(async () => {
    setFavoriteIds(() => {
      favoritesSave([]).catch(() => {});
      return [];
    });
  }, []);

  const isFavorite = useCallback(
    (id) => favoriteIds.includes(id),
    [favoriteIds],
  );

  const value = useMemo(
    () => ({
      loading,
      favoriteIds,
      isFavorite,
      addFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [
      loading,
      favoriteIds,
      isFavorite,
      addFavorite,
      removeFavorite,
      clearFavorites,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export default FavoritesProvider;
