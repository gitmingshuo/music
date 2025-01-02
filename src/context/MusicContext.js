import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { albums } from '../Home';  // 确保正确导入 albums

const MusicContext = createContext();

// 工具函数
const getAlbumInfo = (songName) => {
  try {
    for (const album of albums) {
      if (album.songs.includes(songName)) {
        return {
          albumName: album.name,
          albumCover: album.cover
        };
      }
    }
    return {
      albumName: '最伟大的作品',
      albumCover: '/static/media/最伟大的作品.jpg'
    };
  } catch (error) {
    console.error('获取专辑信息失败:', error);
    return {
      albumName: '未知专辑',
      albumCover: '/static/media/最伟大的作品.jpg'
    };
  }
};

const getAudioPath = (songName) => {
  // 确保 songName 是经过编码的
  const encodedSongName = encodeURIComponent(songName);
  return `${window.location.origin}/static/music/${encodedSongName}.mp3`;
};

const getLyricsPath = (songName) => {
  // 确保 songName 是经过编码的
  const encodedSongName = encodeURIComponent(songName);
  return `${window.location.origin}/static/lyrics/${encodedSongName}.json`;
};

// 修改歌词加载的错误处理
const loadLyrics = async (songName) => {
  try {
    const response = await fetch(getLyricsPath(songName));
    if (!response.ok) {
      throw new Error('加载歌词失败');
    }
    const data = await response.json();
    return data.lyrics || [];
  } catch (error) {
    console.warn('歌词加载失败，使用默认歌词:', error);
    return [
      { time: 0, text: '暂无歌词' },
      { time: 1, text: '请欣赏音乐' }
    ];
  }
};

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
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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
    const nextSong = playlist[nextIndex];
    
    setCurrentSong({
      ...nextSong,
      audio: getAudioPath(nextSong.name)
    });
    setIsPlaying(true);
    addToRecentPlays(nextSong);
  };

  const playPrevious = () => {
    if (!playlist.length) return;
    const currentIndex = playlist.findIndex(song => song.name === currentSong?.name);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    const prevSong = playlist[prevIndex];
    
    setCurrentSong({
      ...prevSong,
      audio: getAudioPath(prevSong.name)
    });
    setIsPlaying(true);
    addToRecentPlays(prevSong);
  };

  const addToPlaylist = (song, fullPlaylist = null) => {
    console.log('Adding song:', song);
    if (fullPlaylist) {
      const playlistWithAudio = fullPlaylist.map(song => ({
        ...song,
        audio: getAudioPath(song.name)
      }));
      setPlaylist(playlistWithAudio);
    } else {
      setPlaylist(prev => [...prev, { ...song, audio: getAudioPath(song.name) }]);
    }
    
    const songWithAudio = {
      ...song,
      audio: getAudioPath(song.name)
    };
    setCurrentSong(songWithAudio);
    setIsPlaying(true);
    addToRecentPlays(song);
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

  // 添加音频时间更新处理
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setCurrentTime(time);
      setDuration(duration);
    }
  };

  // 添加音频加载完成处理
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // 添加进度条控制函数
  const handleSeek = (newTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // 如果当前是暂停状态，设置为播放状态
      if (!isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('播放失败:', error);
        });
        setIsPlaying(true);
      }
    }
  };

  const value = {
    currentSong,
    isPlaying,
    playlist,
    favorites,
    recentPlays,
    playMode,
    currentTime,
    duration,
    error,
    setCurrentSong,
    setIsPlaying,
    addToRecentPlays,
    clearRecentPlays,
    setCurrentTime,
    setDuration,
    getAlbumInfo,
    getAudioPath,
    getLyricsPath,
    playlists,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    togglePlayMode,
    playNext,
    playPrevious,
    handleSeek,
    isMini,
    toggleMiniMode,
    audioRef,
    toggleFavorite,
    addToPlaylist,
    clearFavorites
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
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onError={(e) => {
          console.error('Audio error:', e);
          setError('播放出错了');
        }}
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

// 导出工具函数
export { getAlbumInfo, getAudioPath, getLyricsPath }; 