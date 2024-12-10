import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';

const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {
  const { currentUser } = useUser();
  const userId = currentUser?.id;
  
  // 初始化时从 localStorage 加载所有用户的收藏数据
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : {};
  });

  // 当收藏列表发生变化时，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (song) => {
    if (!userId) return;
    
    setFavorites(prev => {
      const userFavorites = prev[userId] || [];
      const songIndex = userFavorites.findIndex(fav => fav.name === song.name);
      
      const newFavorites = {
        ...prev,
        [userId]: songIndex === -1
          ? [...userFavorites, song]
          : userFavorites.filter((_, index) => index !== songIndex)
      };
      
      return newFavorites;
    });
  };

  const isFavorite = (songName) => {
    if (!userId) return false;
    const userFavorites = favorites[userId] || [];
    return userFavorites.some(fav => fav.name === songName);
  };

  const getUserFavorites = () => {
    return favorites[userId] || [];
  };

  return (
    <FavoriteContext.Provider value={{
      favorites: getUserFavorites(),
      toggleFavorite,
      isFavorite
    }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
}
