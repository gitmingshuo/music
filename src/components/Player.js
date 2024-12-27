import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaRandom, FaList, FaSyncAlt, FaRetweet, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useMusic } from '../context/MusicContext';
import { albums } from '../Home';
import './Player.css';

function Player() {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  
  const { 
    currentSong, 
    isPlaying, 
    setIsPlaying,
    playNext,
    playPrevious,
    playMode,
    togglePlayMode,
    isMini,
    toggleMiniMode,
    favorites,
    toggleFavorite
  } = useMusic();
  
  const [isLiked, setIsLiked] = useState(false);

  const [volume, setVolume] = useState(1);
  const [prevVolume, setPrevVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const getAlbumInfo = (songName) => {
    for (const album of albums) {
      if (album.songs.includes(songName)) {
        return {
          albumName: album.name,
          albumCover: album.cover
        };
      }
    }
    return null;
  };

  useEffect(() => {
    if (currentSong) {
      const favoritesList = Array.isArray(favorites) ? favorites : [];
      const isFavorited = favoritesList.some(
        fav => fav.name === currentSong.name
      );
      setIsLiked(isFavorited);
    }
  }, [currentSong, favorites]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error('播放失败:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePrevious = (e) => {
    e.stopPropagation();
    playPrevious();
  };

  const handleNext = (e) => {
    e.stopPropagation();
    playNext();
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (currentSong) {
      toggleFavorite(currentSong);
      setIsLiked(!isLiked);
    }
  };

  const handlePlayMode = (e) => {
    e.stopPropagation();
    togglePlayMode();
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleKeyPress = (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay(e);
    } else if (e.code === 'ArrowLeft') {
      audioRef.current.currentTime = Math.max(0, currentTime - 5);
    } else if (e.code === 'ArrowRight') {
      audioRef.current.currentTime = Math.min(duration, currentTime + 5);
    }
  };

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      
      const updateTime = () => {
        if (!isDragging) {
          setCurrentTime(audio.currentTime);
        }
      };
      
      const updateDuration = () => {
        setDuration(audio.duration);
        if (isPlaying) {
          audio.play().catch(error => {
            console.error('播放失败:', error);
          });
        }
      };
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      window.addEventListener('keydown', handleKeyPress);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [currentSong, isPlaying, isDragging]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('播放失败:', error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const getPlayModeIcon = () => {
    switch(playMode) {
      case 'single':
        return <FaRetweet />;
      case 'random':
        return <FaRandom />;
      case 'list':
      default:
        return <FaList />;
    }
  };

  const getPlayModeTitle = () => {
    switch(playMode) {
      case 'single':
        return '单曲循环';
      case 'random':
        return '随机播放';
      case 'list':
      default:
        return '列表循环';
    }
  };

  const handleSongEnd = () => {
    if (playMode === 'single') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (playMode === 'random') {
      const playlist = albums.flatMap(album => album.songs);
      const randomIndex = Math.floor(Math.random() * playlist.length);
      playNext(randomIndex);
    } else {
      playNext();
    }
  };

  const handleProgressMouseDown = (e) => {
    setIsDragging(true);
    handleProgressChange(e);
  };

  const handleProgressMouseMove = (e) => {
    if (isDragging) {
      handleProgressChange(e);
    }
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  const handleProgressChange = (e) => {
    if (!audioRef.current || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const newTime = percent * duration;
    
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setPrevVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        setVolume(prevVolume);
        audioRef.current.volume = prevVolume;
      } else {
        setPrevVolume(volume);
        setVolume(0);
        audioRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };

  const handleDoubleClick = () => {
    if (toggleMiniMode) {
      toggleMiniMode();
    }
  };

  return (
    <div 
      className={`player ${isMini ? 'mini' : ''}`} 
      onClick={e => e.stopPropagation()}
      onDoubleClick={handleDoubleClick}
    >
      {error && (
        <div className="player-error">
          {error}
        </div>
      )}
      <div className="player-left">
        <div className="player-cover">
          {currentSong?.name && (
            <img 
              src={getAlbumInfo(currentSong.name)?.albumCover} 
              alt={currentSong.name} 
            />
          )}
        </div>
        <div className="player-song-info">
          <div className="song-name">{currentSong?.name || '未播放'}</div>
          <div className="artist-name">
            {currentSong?.name ? getAlbumInfo(currentSong.name)?.albumName || '-' : '-'}
          </div>
        </div>
      </div>
      
      {!isMini && (
        <div className="player-center">
          <div className="control-buttons">
            <button 
              onClick={handlePrevious} 
              className="control-btn"
              aria-label="上一首"
              disabled={!currentSong}
            >
              <FaStepBackward />
            </button>
            <button 
              className="play-pause"
              onClick={togglePlay}
              aria-label={isPlaying ? "暂停" : "播放"}
              disabled={!currentSong}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button 
              onClick={handleNext}
              className="control-btn"
              aria-label="下一首"
              disabled={!currentSong}
            >
              <FaStepForward />
            </button>
          </div>
          
          <div className="progress-container">
            <span className="time-current">{formatTime(currentTime)}</span>
            <div 
              className="progress-bar"
              ref={progressRef}
              onMouseDown={handleProgressMouseDown}
              onMouseMove={handleProgressMouseMove}
              onMouseUp={handleProgressMouseUp}
              onMouseLeave={handleProgressMouseUp}
            >
              <div 
                className="progress"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              <div 
                className="progress-handle"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span className="time-total">{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {!isMini ? (
        <div className="player-right">
          <button 
            className={`like-btn ${isLiked ? 'active' : ''}`}
            onClick={handleLike}
            disabled={!currentSong}
          >
            <FaHeart />
          </button>
          <button 
            className={`mode-btn ${currentSong ? '' : 'disabled'}`}
            onClick={handlePlayMode}
            title={getPlayModeTitle()}
            disabled={!currentSong}
          >
            {getPlayModeIcon()}
          </button>
          
          <div className="volume-control">
            <button 
              className="volume-btn"
              onClick={toggleMute}
              title={isMuted ? "取消静音" : "静音"}
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <div className="volume-slider-container">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mini-controls">
          <button 
            className="play-pause mini"
            onClick={togglePlay}
            aria-label={isPlaying ? "暂停" : "播放"}
            disabled={!currentSong}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
        </div>
      )}

      <audio
        ref={audioRef}
        src={currentSong?.audio}
        onError={(e) => {
          console.error('音频加载失败:', e);
          console.log('当前音频路径:', currentSong?.audio);
          console.log('当前歌曲信息:', currentSong);
          setError('音频加载失败，请稍后重试');
        }}
        onEnded={handleSongEnd}
      />
    </div>
  );
}

export default Player;
