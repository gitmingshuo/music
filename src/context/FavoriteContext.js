import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
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

  const isFavorite = (song) => {
    return favorites.some(item => item.name === song.name);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
