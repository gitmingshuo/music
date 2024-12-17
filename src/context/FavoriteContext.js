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

    // 确保 song 是对象格式
    const songObject = typeof song === 'string' 
      ? { name: song } 
      : song;

    const newFavorites = favorites.some(f => f.name === songObject.name)
      ? favorites.filter(f => f.name !== songObject.name)
      : [...favorites, { 
          name: songObject.name,
          albumName: songObject.albumName,
          albumCover: songObject.albumCover || songObject.cover,
          audio: songObject.audio
        }];

    setFavorites(newFavorites);
    updateUserFavorites(newFavorites);
  };

  const isFavorite = (songName) => {
    return favorites.some(f => f.name === songName);
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
