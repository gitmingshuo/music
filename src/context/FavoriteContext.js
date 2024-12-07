import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  const isFavorite = useCallback((song) => {
    if (!song) return false;
    return favorites.some(fav => fav.name === song.name);
  }, [favorites]);

  const toggleFavorite = (song) => {
    setFavorites(prev => {
      const exists = prev.some(item => item.name === song.name);
      if (exists) {
        return prev.filter(item => item.name !== song.name);
      } else {
        return [song, ...prev];
      }
    });
  };

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoriteContext);
}
