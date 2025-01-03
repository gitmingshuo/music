import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { albums } from '../Home';  // 确保正确导入 albums
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
  const [playlists, setPlaylists] = useState([{
    id: 'default',
    name: '我喜欢的音乐',
    songs: []
  }]);

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
  const [playMode, setPlayMode] = useState(() => localStorage.getItem('playMode') || 'list');
  const [isMini, setIsMini] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLyrics, setCurrentLyrics] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
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
    if (!userId) return;
    
    setPlaylists(prev => {
      const newPlaylists = prev.map(playlist => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            songs: playlist.songs.filter(song => song.name !== songName)
          };
        }
        return playlist;
      });
      userStorage.set(userId, 'playlists', newPlaylists);
      return newPlaylists;
    });
  };

  const deletePlaylist = (playlistId) => {
    if (!userId) return;
    
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

  const clearRecentPlays = () => {
    if (!userId) return; // 未登录时不执行操作
    
    setRecentPlays([]);
    userStorage.remove(userId, 'recentPlays');
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

  // 添加音频时间更新处理
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setCurrentTime(time);
      setDuration(duration);

      // 更新当前歌词索引
      if (currentLyrics.length > 0) {
        const index = currentLyrics.findIndex((lyric, i) => {
          const nextTime = currentLyrics[i + 1]?.time || Infinity;
          return lyric.time <= time && time < nextTime;
        });
        if (index !== -1) {
          setCurrentLyricIndex(index);
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
  const toggleMiniMode = () => {
    setIsMini(prev => !prev);
  };

  // 在 useEffect 中添加歌词加载逻辑
  useEffect(() => {
    if (currentSong?.name) {
      loadLyrics(currentSong.name).then(lyrics => {
        setCurrentLyrics(lyrics);
        setCurrentLyricIndex(0);
      });
    }
  }, [currentSong?.name]);

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