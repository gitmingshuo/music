import React, { createContext, useContext, useState } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playMode, setPlayMode] = useState('sequence'); // sequence, loop, shuffle

  const addToPlaylist = (song, fullPlaylist = []) => {
    if (fullPlaylist.length > 0) {
      setPlaylist(fullPlaylist);
      const index = fullPlaylist.findIndex(item => item.name === song.name);
      setCurrentIndex(index !== -1 ? index : 0);
    } else {
      setPlaylist([song]);
      setCurrentIndex(0);
    }
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const playNext = () => {
    if (!playlist.length) return;
    
    let nextIndex;
    if (playMode === 'shuffle') {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else if (playMode === 'loop') {
      nextIndex = currentIndex;
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    
    setCurrentIndex(nextIndex);
    setCurrentSong(playlist[nextIndex]);
    setIsPlaying(true);
  };

  const playPrevious = () => {
    if (!playlist.length) return;
    
    let prevIndex;
    if (playMode === 'shuffle') {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else if (playMode === 'loop') {
      prevIndex = currentIndex;
    } else {
      prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    }
    
    setCurrentIndex(prevIndex);
    setCurrentSong(playlist[prevIndex]);
    setIsPlaying(true);
  };

  const togglePlayMode = () => {
    setPlayMode(current => {
      switch (current) {
        case 'sequence': return 'loop';
        case 'loop': return 'shuffle';
        case 'shuffle': return 'sequence';
        default: return 'sequence';
      }
    });
  };

  return (
    <PlayerContext.Provider value={{
      currentSong,
      setCurrentSong,
      isPlaying,
      setIsPlaying,
      playlist,
      currentIndex,
      playNext,
      playPrevious,
      addToPlaylist,
      playMode,
      togglePlayMode
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
