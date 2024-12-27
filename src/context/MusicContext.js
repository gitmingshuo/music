import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      const parsed = savedFavorites ? JSON.parse(savedFavorites) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  });
  const [recentPlays, setRecentPlays] = useState(() => {
    try {
      const savedRecentPlays = localStorage.getItem('recentPlays');
      return savedRecentPlays ? JSON.parse(savedRecentPlays) : [];
    } catch (error) {
      console.error('Error loading recent plays:', error);
      return [];
    }
  });
  const [playMode, setPlayMode] = useState(() => {
    return localStorage.getItem('playMode') || 'list';
  });
  const audioRef = useRef(null);
  const [playlists, setPlaylists] = useState(() => {
    try {
      const savedPlaylists = localStorage.getItem('playlists');
      return savedPlaylists ? JSON.parse(savedPlaylists) : [{
        id: 'default',
        name: '我喜欢的音乐',
        songs: []
      }];
    } catch (error) {
      console.error('Error loading playlists:', error);
      return [{
        id: 'default',
        name: '我喜欢的音乐',
        songs: []
      }];
    }
  });
  const [isMini, setIsMini] = useState(false);

  useEffect(() => {
    try {
      const favoritesToSave = Array.isArray(favorites) ? favorites : [];
      localStorage.setItem('favorites', JSON.stringify(favoritesToSave));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('recentPlays', JSON.stringify(recentPlays));
    } catch (error) {
      console.error('Error saving recent plays:', error);
    }
  }, [recentPlays]);

  useEffect(() => {
    try {
      localStorage.setItem('playlists', JSON.stringify(playlists));
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('playMode', playMode);
  }, [playMode]);

  useEffect(() => {
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      audioRef.current = audioElement;
    }
  }, []);

  // 播放器相关方法
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    if (!playlist.length) return;
    const currentIndex = playlist.findIndex(song => song.name === currentSong?.name);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentSong(playlist[nextIndex]);
  };

  const playPrevious = () => {
    if (!playlist.length) return;
    const currentIndex = playlist.findIndex(song => song.name === currentSong?.name);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentSong(playlist[prevIndex]);
  };

  const addToPlaylist = (song, fullPlaylist = null) => {
    console.log('Adding song:', song);
    if (fullPlaylist) {
      console.log('Full playlist:', fullPlaylist);
      setPlaylist(fullPlaylist);
    } else {
      setPlaylist(prev => [...prev, song]);
    }
    setCurrentSong(song);
    setIsPlaying(true);
  };

  // 收藏相关方法
  const toggleFavorite = (song) => {
    setFavorites(prev => {
      const prevList = Array.isArray(prev) ? prev : [];
      const exists = prevList.some(f => f.name === song.name);
      const newFavorites = exists
        ? prevList.filter(f => f.name !== song.name)
        : [...prevList, song];
      
      // 立即保存到 localStorage
      try {
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
      
      return newFavorites;
    });
  };

  // 最近播放相关方法
  const addToRecentPlays = (song) => {
    setRecentPlays(prev => {
      if (!Array.isArray(prev)) prev = [];
      const filtered = prev.filter(p => p.name !== song.name);
      return [song, ...filtered].slice(0, 20);
    });
  };

  const clearRecentPlays = () => {
    setRecentPlays([]);
    localStorage.removeItem('recentPlays');
  };

  // 播放模式相关方法
  const togglePlayMode = () => {
    setPlayMode(prev => {
      switch (prev) {
        case 'list': return 'single';
        case 'single': return 'random';
        default: return 'list';
      }
    });
  };

  // 创建新歌单
  const createPlaylist = (name) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      songs: []
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  // 添加歌曲到歌单
  const addSongToPlaylist = (playlistId, song) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        // 检查歌曲是否已存在
        if (!playlist.songs.some(s => s.name === song.name)) {
          return {
            ...playlist,
            songs: [...playlist.songs, song]
          };
        }
      }
      return playlist;
    }));
  };

  // 从歌单移除歌曲
  const removeSongFromPlaylist = (playlistId, songName) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          songs: playlist.songs.filter(song => song.name !== songName)
        };
      }
      return playlist;
    }));
  };

  const deletePlaylist = (playlistId) => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
  };

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('favorites');
  };

  // 添加切换迷你模式的函数
  const toggleMiniMode = () => {
    setIsMini(prev => !prev);
  };

  const value = {
    currentSong,
    isPlaying,
    playlist,
    favorites,
    recentPlays,
    playMode,
    setCurrentSong,
    setIsPlaying,
    togglePlay,
    addToPlaylist,
    toggleFavorite,
    addToRecentPlays,
    clearRecentPlays,
    togglePlayMode,
    playlists,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    clearFavorites,
    isMini,
    toggleMiniMode,
    audioRef
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={currentSong?.audio}
        onEnded={playNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => console.error('Audio error:', e)}
      />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
} 