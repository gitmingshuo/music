import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { albums } from '../Home';
import { useAuth } from './AuthContext';
import { userStorage } from '../utils/userStorage';

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
  try {
    const encodedSongName = encodeURIComponent(songName);
    // 检查音频文件是否存在
    const audioPath = `/static/music/${encodedSongName}.mp3`;
    return audioPath;
  } catch (error) {
    console.warn('获取音频路径失败，使用默认音频:', error);
    // 返回默认音频路径
    return '/static/music/粉色海洋.mp3';
  }
};

const getLyricsPath = (songName) => {
  try {
    const encodedSongName = encodeURIComponent(songName);
    // 检查歌词文件是否存在
    const lyricsPath = `/static/lyrics/${encodedSongName}.json`;
    return lyricsPath;
  } catch (error) {
    console.warn('获取歌词路径失败，使用默认歌词:', error);
    // 返回默认歌词路径
    return '/static/lyrics/粉色海洋.json';
  }
};

// 添加歌词加载函数
const loadLyrics = async (songName) => {
  if (!songName) return [];
  
  try {
    const response = await fetch(getLyricsPath(songName));
    if (!response.ok) {
      throw new Error('加载歌词失败');
    }
    const data = await response.json();
    if (data.lyrics && data.lyrics.length > 0) {
      return data.lyrics;
    }
    throw new Error('歌词格式错误');
  } catch (err) {
    console.warn('歌词加载失败，使用默认歌词:', err);
    // 加载默认歌词
    const defaultResponse = await fetch('/static/lyrics/粉色海洋.json');
    const defaultData = await defaultResponse.json();
    return defaultData.lyrics || [];
  }
};

export function MusicProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;

  // 移除这些初始化，改为在 useEffect 中处理
  const [favorites, setFavorites] = useState([]);
  const [recentPlays, setRecentPlays] = useState([]);
  const [playlists, setPlaylists] = useState(() => {
    return userStorage.get(userId, 'playlists', []);
  });

  // 在用户ID变化时重新加载数据
  useEffect(() => {
    if (userId) {
      // 加载该用户的收藏
      const userFavorites = userStorage.get(userId, 'favorites', []);
      setFavorites(userFavorites);

      // 加载该用户的最近播放
      const userRecentPlays = userStorage.get(userId, 'recentPlays', []);
      setRecentPlays(userRecentPlays);

      // 加载该用户的歌单
      const userPlaylists = userStorage.get(userId, 'playlists', [{
        id: 'default',
        name: '我喜欢的音乐',
        songs: []
      }]);
      setPlaylists(userPlaylists);
    } else {
      // 用户未登录时重置所有状态
      setFavorites([]);
      setRecentPlays([]);
      setPlaylists([{
        id: 'default',
        name: '我喜欢的音乐',
        songs: []
      }]);
    }
  }, [userId]); // 当 userId 变化时触发

  // 修改数据操作方法，确保每次都使用最新的 userId
  const toggleFavorite = (song) => {
    if (!userId) return;
    setFavorites(prev => {
      const exists = prev.some(f => f.name === song.name);
      const newFavorites = exists
        ? prev.filter(f => f.name !== song.name)
        : [...prev, song];
      userStorage.set(userId, 'favorites', newFavorites);
      return newFavorites;
    });
  };

  const addToRecentPlays = (song) => {
    if (!userId) return;
    setRecentPlays(prev => {
      const filtered = prev.filter(p => p.name !== song.name);
      const newRecentPlays = [song, ...filtered].slice(0, 20);
      userStorage.set(userId, 'recentPlays', newRecentPlays);
      return newRecentPlays;
    });
  };

  const createPlaylist = (name) => {
    if (!userId) return;
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      songs: []
    };
    setPlaylists(prev => {
      const newPlaylists = [...prev, newPlaylist];
      userStorage.set(userId, 'playlists', newPlaylists);
      return newPlaylists;
    });
  };

  // 移除之前的 useEffect，因为现在在操作方法中直接保存数据
  // useEffect(() => {...}, [userId, favorites]);
  // useEffect(() => {...}, [userId, recentPlays]);
  // useEffect(() => {...}, [userId, playlists]);

  // 基础播放状态
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [playMode, setPlayMode] = useState(() => 
    localStorage.getItem('playMode') || 'list'
  );
  const [isMini, setIsMini] = useState(() => 
    localStorage.getItem('isMiniModeEnabled') === 'true'
  );
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLyrics, setCurrentLyrics] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const audioRef = useRef(null);

  // 歌单相关方法
  const addSongToPlaylist = (playlistId, song) => {
    if (!userId) return;
    
    setPlaylists(prev => {
      const newPlaylists = prev.map(playlist => {
        if (playlist.id === playlistId && !playlist.songs.some(s => s.name === song.name)) {
          return {
            ...playlist,
            songs: [...playlist.songs, song]
          };
        }
        return playlist;
      });
      userStorage.set(userId, 'playlists', newPlaylists);
      return newPlaylists;
    });
  };

  const removeSongFromPlaylist = (playlistId, songName) => {
    setPlaylists(prev => {
      const newPlaylists = prev.map(playlist => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            songs: playlist.songs.filter(song => 
              (typeof song === 'string' ? song : song.name) !== songName
            )
          };
        }
        return playlist;
      });
      userStorage.set(userId, 'playlists', newPlaylists);
      return newPlaylists;
    });
  };

  const deletePlaylist = (playlistId) => {
    setPlaylists(prev => {
      const newPlaylists = prev.filter(playlist => playlist.id !== playlistId);
      userStorage.set(userId, 'playlists', newPlaylists);
      return newPlaylists;
    });
  };

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
    let nextIndex;
    
    if (playMode === 'random') {
      // 随机模式：随机选择一首（排除当前歌曲）
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex && playlist.length > 1);
    } else {
      // 顺序模式：播放下一首
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    
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
    let prevIndex;
    
    if (playMode === 'random') {
      // 随机模式：随机选择一首（排除当前歌曲）
      do {
        prevIndex = Math.floor(Math.random() * playlist.length);
      } while (prevIndex === currentIndex && playlist.length > 1);
    } else {
      // 顺序模式：播放上一首
      prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    }
    
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

  const clearRecentPlays = () => {
    if (!userId) return; // 未登录时不执行操作
    
    setRecentPlays([]);
    userStorage.remove(userId, 'recentPlays');
  };

  // 播放模式相关方法
  const togglePlayMode = () => {
    const newMode = playMode === 'list' ? 'random' : 'list';
    setPlayMode(newMode);
    localStorage.setItem('playMode', newMode);
  };

  // 添加音频时间更新处理
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);

      // 更新总播放时间
      setPlayStats(prev => {
        const newStats = {
          ...prev,
          totalPlayTime: prev.totalPlayTime + 1  // 每秒增加1秒
        };
        userStorage.set(userId, 'playStats', newStats);
        return newStats;
      });

      // 更新歌词索引
      if (currentLyrics && currentLyrics.length > 0) {
        let foundIndex = -1;
        for (let i = 0; i < currentLyrics.length; i++) {
          if (time >= currentLyrics[i].time) {
            foundIndex = i;
          } else {
            break;
          }
        }
        if (foundIndex !== currentLyricIndex) {
          setCurrentLyricIndex(foundIndex);
        }
      }
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

  // 添加切换迷你模式的函数
  const toggleMiniMode = (value) => {
    const newValue = typeof value === 'boolean' ? value : !isMini;
    setIsMini(newValue);
    localStorage.setItem('isMiniModeEnabled', newValue);
  };

  // 修改歌词加载逻辑
  useEffect(() => {
    const loadCurrentLyrics = async () => {
      if (currentSong?.name) {
        try {
          const response = await fetch(getLyricsPath(currentSong.name));
          if (!response.ok) throw new Error('Failed to load lyrics');
          const data = await response.json();
          if (data.lyrics && Array.isArray(data.lyrics)) {
            // 确保歌词时间是数字
            const processedLyrics = data.lyrics.map(lyric => ({
              ...lyric,
              time: parseFloat(lyric.time)
            }));
            setCurrentLyrics(processedLyrics);
            setCurrentLyricIndex(-1); // 重置歌词索引
          }
        } catch (error) {
          console.error('Error loading lyrics:', error);
          setCurrentLyrics([]);
          setCurrentLyricIndex(-1);
        }
      }
    };

    loadCurrentLyrics();
  }, [currentSong?.name]);

  // 添加播放统计
  const [playStats, setPlayStats] = useState(() => {
    return userStorage.get(userId, 'playStats', {
      mostPlayed: [],
      recentPlayed: [],
      totalPlayTime: 0,
      weeklyPlays: 0,
      currentSession: 0,
      lastSessionTime: Date.now()  // 添加会话时间记录
    });
  });

  // 更新播放统计
  const updatePlayStats = (song) => {
    setPlayStats(prev => {
      // 获取本周开始时间
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      // 更新统计
      const newStats = {
        ...prev,
        recentPlayed: [song, ...prev.recentPlayed].slice(0, 50),
        totalPlayTime: prev.totalPlayTime + (song.duration || 0),
        weeklyPlays: prev.weeklyPlays + 1,
        currentSession: prev.currentSession + 1
      };

      // 保存到本地存储
      userStorage.set(userId, 'playStats', newStats);
      return newStats;
    });
  };

  // 在音频播放开始时更新统计
  useEffect(() => {
    if (currentSong && isPlaying) {
      updatePlayStats(currentSong);
    }
  }, [currentSong, isPlaying]);

  // 添加快捷键设置
  const [shortcuts, setShortcuts] = useState(() => {
    return userStorage.get(userId, 'shortcuts', {
      playPause: 'Space',
      nextTrack: 'ArrowRight',
      prevTrack: 'ArrowLeft',
      volumeUp: 'ArrowUp',
      volumeDown: 'ArrowDown'
    });
  });

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === shortcuts.playPause) togglePlay();
      if (e.key === shortcuts.nextTrack) playNext();
      if (e.key === shortcuts.prevTrack) playPrevious();
      // ...其他快捷键
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts]);

  const [timer, setTimer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const startTimer = (minutes) => {
    clearTimeout(timer);
    const endTime = Date.now() + minutes * 60 * 1000;
    
    setTimer(setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        clearInterval(timer);
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    }, 1000));
  };

  const [isFullscreen, setIsFullscreen] = useState(false);

  // 添加切换全屏的方法
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // 音频设置
  const [defaultVolume, setDefaultVolume] = useState(() => 
    parseFloat(localStorage.getItem('defaultVolume')) || 1
  );
  const [autoPlay, setAutoPlay] = useState(() => 
    localStorage.getItem('autoPlay') === 'true'
  );
  const [crossfade, setCrossfade] = useState(() => 
    localStorage.getItem('crossfade') === 'true'
  );

  // 保存音频设置
  useEffect(() => {
    localStorage.setItem('defaultVolume', defaultVolume);
    localStorage.setItem('autoPlay', autoPlay);
    localStorage.setItem('crossfade', crossfade);

    // 应用音频设置
    if (audioRef.current) {
      audioRef.current.volume = defaultVolume;
    }
  }, [defaultVolume, autoPlay, crossfade]);

  // 修改歌曲播放完成的处理
  const handleSongComplete = () => {
    // 更新播放统计
    setPlayStats(prev => {
      const newStats = {
        ...prev,
        weeklyPlays: prev.weeklyPlays + 1,
        currentSession: prev.currentSession + 1
      };
      userStorage.set(userId, 'playStats', newStats);
      return newStats;
    });

    // 如果开启了自动播放，播放下一首
    if (autoPlay) {
      playNext();
    }
  };

  // 修改下一首歌曲的逻辑
  const handleNext = () => {
    if (!currentSong || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(
      song => song.name === currentSong.name
    );

    let nextIndex;
    if (playMode === 'random') {
      // 随机模式：随机选择一首歌（排除当前歌曲）
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex && playlist.length > 1);
    } else {
      // 顺序模式：播放下一首歌
      nextIndex = (currentIndex + 1) % playlist.length;
    }

    setCurrentSong(playlist[nextIndex]);
  };

  // 修改上一首歌曲的逻辑
  const handlePrevious = () => {
    if (!currentSong || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(
      song => song.name === currentSong.name
    );

    let prevIndex;
    if (playMode === 'random') {
      // 随机模式：随机选择一首歌（排除当前歌曲）
      do {
        prevIndex = Math.floor(Math.random() * playlist.length);
      } while (prevIndex === currentIndex && playlist.length > 1);
    } else {
      // 顺序模式：播放上一首歌
      prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    }

    setCurrentSong(playlist[prevIndex]);
  };

  const value = {
    currentSong,
    isPlaying,
    playlist,
    favorites,
    recentPlays,
    playlists,
    playMode,
    currentTime,
    duration,
    error,
    isMini,
    getAlbumInfo,
    getAudioPath,
    getLyricsPath,
    setCurrentSong,
    setIsPlaying,
    toggleFavorite,
    addToRecentPlays,
    createPlaylist,
    addSongToPlaylist,                                                                                                         
    removeSongFromPlaylist,
    deletePlaylist,
    togglePlayMode,
    playNext,
    playPrevious,
    handleSeek,
    toggleMiniMode,
    audioRef,
    addToPlaylist,
    currentLyrics,
    currentLyricIndex,
    loadLyrics,
    clearRecentPlays,
    playStats,
    updatePlayStats,
    shortcuts,
    startTimer,
    timeRemaining,
    isFullscreen,
    toggleFullscreen,
    albums,
    defaultVolume,
    setDefaultVolume,
    autoPlay,
    setAutoPlay,
    crossfade,
    setCrossfade,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={currentSong?.audio}
        onEnded={handleSongComplete}
        onTimeUpdate={handleTimeUpdate}  // 确保这个事件处理器被正确绑定
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={handleLoadedMetadata}
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