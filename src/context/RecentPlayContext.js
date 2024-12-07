import React, { createContext, useContext, useState, useEffect } from 'react';

const RecentPlayContext = createContext();

export function RecentPlayProvider({ children }) {
  const [recentPlays, setRecentPlays] = useState(() => {
    const saved = localStorage.getItem('recentPlays');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('recentPlays', JSON.stringify(recentPlays));
  }, [recentPlays]);

  const addToRecentPlays = (song) => {
    if (!song || !song.name || !song.album || !song.cover) {
      console.warn('无效的歌曲数据:', song);
      return;
    }

    setRecentPlays(prevPlays => {
      const filteredPlays = prevPlays.filter(p => p.name !== song.name);
      const newPlays = [song, ...filteredPlays].slice(0, 20);
      
      localStorage.setItem('recentPlays', JSON.stringify(newPlays));
      
      return newPlays;
    });
  };

  return (
    <RecentPlayContext.Provider value={{ recentPlays, addToRecentPlays }}>
      {children}
    </RecentPlayContext.Provider>
  );
}

export function useRecentPlays() {
  const context = useContext(RecentPlayContext);
  if (!context) {
    throw new Error('useRecentPlays must be used within a RecentPlayProvider');
  }
  return context;
}