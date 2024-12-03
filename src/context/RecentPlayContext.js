import React, { createContext, useContext, useState, useEffect } from 'react';

const RecentPlayContext = createContext();

export function RecentPlayProvider({ children }) {
  const [recentPlays, setRecentPlays] = useState(() => {
    const saved = localStorage.getItem('recentPlays');
    return saved ? JSON.parse(saved) : [];
  });

  const addToRecent = (song) => {
    setRecentPlays(prev => {
      const filtered = prev.filter(item => item.name !== song.name);
      const updated = [song, ...filtered].slice(0, 20);
      localStorage.setItem('recentPlays', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <RecentPlayContext.Provider value={{ recentPlays, addToRecent }}>
      {children}
    </RecentPlayContext.Provider>
  );
}

export function useRecentPlays() {
  return useContext(RecentPlayContext);
}