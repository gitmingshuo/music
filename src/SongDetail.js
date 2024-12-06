import React, { useEffect, useRef, useReducer } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SongDetail.css';
import './SongDetail.mobile.css';
import Comments from './components/Comments';
import { useFavorites } from './context/FavoriteContext';
import { FaHeart } from 'react-icons/fa';
import { useRecentPlays } from './context/RecentPlayContext';
import BackButton from './components/BackButton';
import { switchSong } from './utils/songHandler';

// 添加设备识别函数
const isMobile = () => {
  const ua = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|HarmonyOS|HMSCore/i.test(ua) 
    || window.innerWidth <= 768;
};

// 定义初始状态
const initialState = {
  isMobileDevice: isMobile(),
  currentTime: 0,
  currentLyricIndex: 0,
  isPlaying: false,
  duration: 0,
  userScrolling: false,
};

// 定义 reducer 函数
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_MOBILE_DEVICE':
      return { ...state, isMobileDevice: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_CURRENT_LYRIC_INDEX':
      return { ...state, currentLyricIndex: action.payload };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_USER_SCROLLING':
      return { ...state, userScrolling: action.payload };
    default:
      return state;
  }
};

function SongDetail() {
  // 使用 useReducer 替代 useState
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isMobileDevice, currentTime, currentLyricIndex, isPlaying, duration, userScrolling } = state;

  // 2. 所有的 ref 声明
  const audioRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const scrollTimeout = useRef(null);

  // 3. 路由相关的 hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { song, lyrics, audio, albumCover, albumName, songList, currentIndex } = location.state || {};

  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToRecent } = useRecentPlays();

  // 4. 统一管理所有的副作用
  useEffect(() => {
    // 设备检测
    const handleResize = () => dispatch({ type: 'SET_MOBILE_DEVICE', payload: isMobile() });
    window.addEventListener('resize', handleResize);

    // 歌词容器滚动听
    const container = lyricsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // 5. 歌词滚动相关的副作用
  useEffect(() => {
    if (!userScrolling) {
      scrollToCurrentLyric();
    }
  }, [currentTime, userScrolling]);

  // 6. 自动播放相关的副作用
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => dispatch({ type: 'TOGGLE_PLAY', payload: true }))
        .catch(error => {
          console.warn('自动播放失败:', error);
          dispatch({ type: 'TOGGLE_PLAY', payload: false });
        });
    }
  }, [song]);

  // 格式化时间
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 处理进度条点击
  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX;
    const progressWidth = progressBar.offsetWidth;
    const newTime = (clickPosition / progressWidth) * duration;
    audioRef.current.currentTime = newTime;
  };

  // 高亮当前歌词
  const scrollToCurrentLyric = () => {
    if (userScrolling) return;
    
    const lyricsContainer = lyricsContainerRef.current;
    const activeLyric = lyricsContainer?.querySelector('.lyric.active');
    
    if (activeLyric && lyricsContainer) {
      const containerRect = lyricsContainer.getBoundingClientRect();
      const lyricRect = activeLyric.getBoundingClientRect();
      
      const scrollTop = lyricsContainer.scrollTop + 
        (lyricRect.top - containerRect.top) - 
        (containerRect.height / 2) + 
        (lyricRect.height / 2);
      
      lyricsContainer.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  };

  // 听时间更新
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      dispatch({ type: 'SET_CURRENT_TIME', payload: time });
      
      // 更新当前歌词
      const index = lyrics?.findIndex((lyric, i) => {
        const nextLyric = lyrics[i + 1];
        return time >= lyric.time && (!nextLyric || time < nextLyric.time);
      });
      
      if (index !== -1) {
        dispatch({ type: 'SET_CURRENT_LYRIC_INDEX', payload: index });
      }
    }
  };

  // 播放控制
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
      dispatch({ type: 'TOGGLE_PLAY', payload: true });
    } else {
      audioRef.current.pause();
      dispatch({ type: 'TOGGLE_PLAY', payload: false });
    }
  };

  // 添加切换歌曲函数
  const switchSong = async (direction) => {
    if (!songList) return;

    try {
      await switchSong(direction, currentIndex, songList, navigate, albumName, albumCover);
    } catch (error) {
      console.error('切换歌曲失败:', error);
      alert('暂时无法切换歌曲，请稍后再试');
    }
  };

  // 处理用户滚动
  const handleScroll = () => {
    dispatch({ type: 'SET_USER_SCROLLING', payload: true });
    
    // 清除之前的定时器
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    // 设置新的定时器，1.5秒后恢复自动滚动
    scrollTimeout.current = setTimeout(() => {
      dispatch({ type: 'SET_USER_SCROLLING', payload: false });
    }, 1500);
  };

  // 添加到最近播放列表
  useEffect(() => {
    if (song && albumName && albumCover) {
      addToRecent({
        name: song,
        album: albumName,
        cover: albumCover
      });
    }
  }, [song, albumName, albumCover, addToRecent]);

  const handleBack = (e) => {
    e.stopPropagation();
    
    // 如果有前一个路径信息，则返回到该路径
    if (location.state?.previousPath) {
      navigate(location.state.previousPath);
    } else {
      navigate(-1);
    }
  };

  // 提前渲染页面，即使数据为空也不会中断
  if (!song) {
    return (
      <div className="error-page">
        <h2>没有找到歌曲信息！</h2>
        <button onClick={handleBack}>返回</button>
      </div>
    );
  }

  return (
    <div className={`song-detail-page ${isMobileDevice ? 'mobile-view' : ''}`}>
      <div className="background-blur" style={{ backgroundImage: `url(${albumCover})` }}></div>
      <div className={`content-wrapper ${isMobileDevice ? 'mobile-content' : ''}`}>
        <div className="back-button-container">
          <button className="back-button" onClick={handleBack}>
            <span>←</span> 返回
          </button>
        </div>
        
        <div className="player-container">
          <div className="left-section">
            <div className="album-cover">
              <img src={albumCover} alt={song} className={`cover-img ${isPlaying ? 'rotating' : ''}`} />
            </div>
            <div className="song-info">
              <h1>{song}</h1>
              <p className="album-name">{albumName}</p>
            </div>
          </div>

          <div className="right-section">
            <div className="lyrics-section">
              <div className="lyrics-container" ref={lyricsContainerRef}>
                {lyrics?.map((line, index) => (
                  <p
                    key={index}
                    className={`lyric ${index === currentLyricIndex ? 'active' : ''}`}
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Comments songName={song} />

        <div className="player-controls">
          <div className="progress-bar" onClick={handleProgressClick}>
            <div className="progress" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
          </div>
          
          <div className="time-info">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="controls">
            <button className="control-btn" onClick={() => switchSong('prev')}>上一首</button>
            <button className={`play-btn ${isPlaying ? 'playing' : ''}`} onClick={togglePlay}>
              {isPlaying ? '暂停' : '播放'}
            </button>
            <button className="control-btn" onClick={() => switchSong('next')}>下一首</button>
          </div>

          <button 
            className={`favorite-btn ${isFavorite(song) ? 'active' : ''}`}
            onClick={() => toggleFavorite({ name: song, album: albumName, cover: albumCover })}
          >
            <FaHeart />
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audio}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => dispatch({ type: 'SET_DURATION', payload: e.target.duration })}
        preload="metadata"
      />
    </div>
  );
}

export default SongDetail;
