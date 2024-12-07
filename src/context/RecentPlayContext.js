import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const RecentPlayContext = createContext();

export function RecentPlayProvider({ children }) {
  const [recentPlays, setRecentPlays] = useState(() => {
    const saved = localStorage.getItem('recentPlays');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('recentPlays', JSON.stringify(recentPlays));
  }, [recentPlays]);

  const addToRecentPlays = useCallback((song) => {
    if (!song) return;
    
    setRecentPlays(prev => {
      const filtered = prev.filter(item => item.name !== song.name);
      const newList = [
        {
          name: song.name,
          album: song.album,
          cover: song.cover,
          audio: song.audio
        },
        ...filtered
      ].slice(0, 20);
      return newList;
    });
  }, []);

  return (
    <RecentPlayContext.Provider value={{ recentPlays, addToRecentPlays }}>
      {children}
    </RecentPlayContext.Provider>
  );
}

export function useRecentPlays() {
  return useContext(RecentPlayContext);
}