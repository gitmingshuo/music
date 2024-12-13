import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建上下文
const RecentPlaysContext = createContext();

export function RecentPlaysProvider({ children }) {
  const [recentPlays, setRecentPlays] = useState(() => {
    const username = localStorage.getItem('username') || 'guest';
    const saved = localStorage.getItem(`recentPlays_${username}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const username = localStorage.getItem('username') || 'guest';
    const saved = localStorage.getItem(`recentPlays_${username}`);
    setRecentPlays(saved ? JSON.parse(saved) : []);
  }, []);

  const addToRecentPlays = (song) => {
    const username = localStorage.getItem('username') || 'guest';
    if (!song?.id) return;

    setRecentPlays((prev) => {
      try {
        const filtered = prev.filter((item) => item.id !== song.id);
        const updatedList = [song, ...filtered].slice(0, 50);
        localStorage.setItem(`recentPlays_${username}`, JSON.stringify(updatedList));
        return updatedList;
      } catch (error) {
        console.error('保存最近播放失败:', error);
        return prev;
      }
    });
  };

  const clearRecentPlays = () => {
    const username = localStorage.getItem('username') || 'guest';
    localStorage.removeItem(`recentPlays_${username}`);
    setRecentPlays([]);
  };

  return (
    <RecentPlaysContext.Provider
      value={{
        recentPlays,
        addToRecentPlays,
        clearRecentPlays,
      }}
    >
      {children}
    </RecentPlaysContext.Provider>
  );
}

export function useRecentPlays() {
  return useContext(RecentPlaysContext);
}
