import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoriteContext = createContext();
const RecentPlayContext = createContext();

export function FavoriteProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    // 从 localStorage 读取初始数据
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  // 当 favorites 改变时，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (song) => {
    return favorites.some(fav => fav.name === song.name && fav.album === song.album);
  };

  const toggleFavorite = (song) => {
    setFavorites(prevFavorites => {
      if (isFavorite(song)) {
        return prevFavorites.filter(fav => !(fav.name === song.name && fav.album === song.album));
      } else {
        return [...prevFavorites, song];
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
