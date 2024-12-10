import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建上下文
const RecentPlaysContext = createContext();

export function RecentPlaysProvider({ children }) {
  // 定义最近播放状态
  const [recentPlays, setRecentPlays] = useState(() => {
    const saved = localStorage.getItem('recentPlays');
    return saved ? JSON.parse(saved) : []; // 从 localStorage 中加载数据
  });

  // 当最近播放列表更新时，将其保存到 localStorage
  useEffect(() => {
    console.log('保存到 localStorage 的最近播放列表:', recentPlays); // 调试日志
    localStorage.setItem('recentPlays', JSON.stringify(recentPlays));
  }, [recentPlays]);

  // 添加到最近播放的方法
  const addToRecentPlays = (song) => {
    console.log('调用 addToRecentPlays，传入的歌曲:', song); // 调试日志
    setRecentPlays((prev) => {
      // 移除重复歌曲
      const filtered = prev.filter((item) => item.name !== song.name);
      // 将新歌曲添加到开头，限制最大保存 50 首
      const updatedList = [song, ...filtered].slice(0, 50);
      console.log('更新后的最近播放列表:', updatedList); // 调试日志
      return updatedList;
    });
  };

  // 清空最近播放列表的方法
  const clearRecentPlays = () => {
    console.log('清空最近播放列表'); // 调试日志
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

// 自定义 Hook，方便使用上下文
export function useRecentPlays() {
  return useContext(RecentPlaysContext);
}
