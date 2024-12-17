import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';

const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {
  const { currentUser, updateUserFavorites } = useUser();
  const [favorites, setFavorites] = useState([]);

  // 当用户变化时，加载该用户的收藏列表
  useEffect(() => {
    if (currentUser) {
      setFavorites(currentUser.favorites || []);
    } else {
      setFavorites([]);
    }
  }, [currentUser]);

  const toggleFavorite = (song) => {
    if (!currentUser) return;

    const newFavorites = favorites.some(f => f.name === song.name)
      ? favorites.filter(f => f.name !== song.name)
      : [...favorites, { ...song, cover: song.cover || song.albumCover }];

    setFavorites(newFavorites);
    updateUserFavorites(newFavorites);
  };

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoriteContext);
}
