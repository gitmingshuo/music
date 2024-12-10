import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';

const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {
  const { currentUser } = useUser();
  const [favorites, setFavorites] = useState(() => {
    if (!currentUser) return [];
    const saved = localStorage.getItem(`favorites_${currentUser.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify(favorites));
    }
  }, [favorites, currentUser]);

  const isFavorite = useCallback((song) => {
    if (!song || !currentUser) return false;
    return favorites.some(fav => fav.name === song.name);
  }, [favorites, currentUser]);

  const toggleFavorite = (song) => {
    if (!currentUser) return;
    
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
    <FavoriteContext.Provider value={{ 
      favorites: currentUser ? favorites : [],
      toggleFavorite: currentUser ? toggleFavorite : () => {},
      isFavorite 
    }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoriteContext);
}
