import React, { createContext, useContext, useState } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [state, setState] = useState({
    currentSong: null,
    playlist: [],
    currentIndex: -1,
    isPlaying: false
  });

  const [playMode, setPlayMode] = useState('sequence');

  // 添加歌曲到播放列表
  const addToPlaylist = (song, playlist) => {
    setState(prev => ({
      ...prev,
      currentSong: song,
      playlist: playlist || [song],
      currentIndex: 0,
      isPlaying: true
    }));
  };

  // 播放下一首
  const playNext = () => {
    setState(prev => {
      if (!prev.playlist.length) return prev;
      
      let nextIndex;
      switch(playMode) {
        case 'shuffle':
          // 随机播放
          nextIndex = Math.floor(Math.random() * prev.playlist.length);
          while (nextIndex === prev.currentIndex && prev.playlist.length > 1) {
            nextIndex = Math.floor(Math.random() * prev.playlist.length);
          }
          break;
        case 'loop':
          // 单曲循环
          nextIndex = prev.currentIndex;
          break;
        default:
          // 顺序播放
          nextIndex = (prev.currentIndex + 1) % prev.playlist.length;
      }

      const nextSong = prev.playlist[nextIndex];
      
      console.log('Playing next song:', nextSong, 'Index:', nextIndex); // 调试日志
      
      return {
        ...prev,
        currentIndex: nextIndex,
        currentSong: nextSong,
        isPlaying: true
      };
    });
  };

  // 播放上一首
  const playPrevious = () => {
    setState(prev => {
      if (!prev.playlist.length) return prev;

      let prevIndex;
      switch(playMode) {
        case 'shuffle':
          // 随机播放
          prevIndex = Math.floor(Math.random() * prev.playlist.length);
          while (prevIndex === prev.currentIndex && prev.playlist.length > 1) {
            prevIndex = Math.floor(Math.random() * prev.playlist.length);
          }
          break;
        case 'loop':
          // 单曲循环
          prevIndex = prev.currentIndex;
          break;
        default:
          // 顺序播放
          prevIndex = prev.currentIndex - 1;
          if (prevIndex < 0) prevIndex = prev.playlist.length - 1;
      }

      const prevSong = prev.playlist[prevIndex];
      
      console.log('Playing previous song:', prevSong, 'Index:', prevIndex); // 调试日志
      
      return {
        ...prev,
        currentIndex: prevIndex,
        currentSong: prevSong,
        isPlaying: true
      };
    });
  };

  // 切换播放模式
  const togglePlayMode = () => {
    setPlayMode(prev => {
      switch(prev) {
        case 'sequence': return 'shuffle';
        case 'shuffle': return 'loop';
        case 'loop': return 'sequence';
        default: return 'sequence';
      }
    });
  };

  const setIsPlaying = (playing) => {
    setState(prev => ({
      ...prev,
      isPlaying: playing
    }));
  };

  return (
    <PlayerContext.Provider value={{
      ...state,
      playMode,
      addToPlaylist,
      setIsPlaying,
      playNext,
      playPrevious,
      togglePlayMode
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
