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
    setRecentPlays(prev => {
      const filtered = prev.filter(item => item.name !== song.name);
      return [song, ...filtered].slice(0, 20);
    });
  }, []);

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