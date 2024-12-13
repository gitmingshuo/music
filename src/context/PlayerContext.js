import React, { createContext, useContext, useState } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [state, setState] = useState({
    currentSong: null,
    playlist: [],
    currentIndex: -1,
    isPlaying: false
  });

  const [isShuffle, setIsShuffle] = useState(false);

  const setCurrentSong = (song) => {
    setState(prev => ({
      ...prev,
      currentSong: song
    }));
  };

  const playNext = () => {
    setState(prev => {
      if (!prev.playlist.length) return prev;
      
      let nextIndex;
      if (isShuffle) {
        // 随机播放逻辑：从列表中随机选一个不等于当前的索引
        const availableIndices = prev.playlist.map((_, i) => i).filter(i => i !== prev.currentIndex);
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      } else {
        nextIndex = prev.currentIndex < prev.playlist.length - 1 
          ? prev.currentIndex + 1 
          : 0;
      }

      if (prev.currentIndex === nextIndex) return prev;

      return {
        ...prev,
        currentIndex: nextIndex,
        currentSong: { ...prev.playlist[nextIndex], autoPlay: true },
        isPlaying: true
      };
    });
  };

  const playPrevious = () => {
    setState(prev => {
      if (!prev.playlist.length) return prev;

      let prevIndex;
      if (isShuffle) {
        // 随机播放逻辑：同上随机选择
        const availableIndices = prev.playlist.map((_, i) => i).filter(i => i !== prev.currentIndex);
        prevIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      } else {
        prevIndex = prev.currentIndex > 0 
          ? prev.currentIndex - 1 
          : prev.playlist.length - 1;
      }

      if (prev.currentIndex === prevIndex) return prev;

      return {
        ...prev,
        currentIndex: prevIndex,
        currentSong: { ...prev.playlist[prevIndex], autoPlay: true },
        isPlaying: true
      };
    });
  };

  const playSong = (song, songList) => {
    setState(prev => {
      const newState = { ...prev };
      
      if (songList) {
        newState.playlist = songList;
      }
      
      const songIndex = songList 
        ? songList.findIndex(item => item.id === song.id)
        : prev.playlist.findIndex(item => item.id === song.id);

      newState.currentIndex = songIndex;
      newState.currentSong = { ...song, autoPlay: true };
      newState.isPlaying = true;

      return newState;
    });
  };

  const setIsPlaying = (playing) => {
    setState(prev => {
      if (prev.isPlaying === playing) return prev;
      return {
        ...prev,
        isPlaying: playing
      };
    });
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  return (
    <PlayerContext.Provider value={{
      ...state,
      setCurrentSong,
      playNext,
      playPrevious,
      playSong,
      setIsPlaying,
      isShuffle,
      toggleShuffle
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
