import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaRandom, FaList, FaRetweet, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useMusic } from '../context/MusicContext';
import './Player.css';
import FullscreenPlayer from './FullscreenPlayer';

function Player() {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(null);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [volume, setVolume] = useState(1);
  const [prevVolume, setPrevVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = window.innerWidth <= 768;
  
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
    toggleFavorite,
    startTimer,
    timeRemaining,
    toggleFullscreen,
    isFullscreen,
    getAlbumInfo
  } = useMusic();

  useEffect(() => {
    if (currentSong) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [currentSong]);

  useEffect(() => {
    if (currentSong) {
      const favoritesList = Array.isArray(favorites) ? favorites : [];
      const isFavorited = favoritesList.some(
        fav => fav.name === currentSong.name
      );
      setIsLiked(isFavorited);
    }
  }, [currentSong, favorites]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => {
        if (!isDragging) {
          setCurrentTime(audio.currentTime);
          setDuration(audio.duration);
        }
      };
      
      audio.addEventListener('timeupdate', updateTime);
      return () => audio.removeEventListener('timeupdate', updateTime);
    }
  }, [isDragging]);

  if (isMobile && !currentSong) {
    return null;
  }

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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressClick = (e) => {
    e.stopPropagation();
    if (!progressRef.current || !duration || !audioRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    document.addEventListener('mousemove', handleProgressMouseMove);
    document.addEventListener('mouseup', handleProgressMouseUp);
  };

  const handleProgressMouseMove = (e) => {
    if (!isDragging || !progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    
    setDragTime(newTime);
  };

  const handleProgressMouseUp = (e) => {
    if (dragTime !== null && audioRef.current) {
      audioRef.current.currentTime = dragTime;
      setCurrentTime(dragTime);
    }
    setIsDragging(false);
    setDragTime(null);
    document.removeEventListener('mousemove', handleProgressMouseMove);
    document.removeEventListener('mouseup', handleProgressMouseUp);
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

  const renderMiniPlayer = () => {
    if (!currentSong) return null;
    
    return (
      <div className="mini-player" onClick={toggleMiniMode}>
        <div className="mini-player-info">
          <div className="mini-player-title">
            <span className="mini-song-name">{currentSong.name}</span>
            <span className="mini-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="mini-progress-bar">
            <div 
              className="mini-progress" 
              style={{ width: `${(currentTime / duration * 100) || 0}%` }}
            />
          </div>
        </div>
        <div className="mini-controls">
          <button 
            className="mini-control-btn"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious(e);
            }}
          >
            <FaStepBackward />
          </button>
          <button 
            className="mini-control-btn mini-play-btn"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay(e);
            }}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button 
            className="mini-control-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleNext(e);
            }}
          >
            <FaStepForward />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`player-container ${!isVisible ? 'hidden' : ''}`}>
      <div className="player-container">
        <div className={`player ${isMini ? 'mini' : ''}`}>
          {isMini ? renderMiniPlayer() : (
            <div className="player-left">
              <div 
                className="player-cover" 
                onClick={toggleFullscreen}
                style={{ cursor: 'pointer' }}
              >
                {currentSong?.name && (
                  <img 
                    src={getAlbumInfo(currentSong.name)?.albumCover || '/default-cover.jpg'} 
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
          )}
          
          {!isMini && (
            <div className="player-center">
              <div className="control-buttons">
                <button 
                  className={`mode-btn ${playMode === 'random' ? 'active' : ''}`}
                  onClick={() => togglePlayMode()}
                  title={playMode === 'random' ? '随机播放' : '顺序播放'}
                >
                  {playMode === 'random' ? <FaRandom /> : <FaRetweet />}
                </button>
                <button className="prev-btn" onClick={handlePrevious}>
                  <FaStepBackward />
                </button>
                <button className="play-pause" onClick={togglePlay}>
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button className="next-btn" onClick={handleNext}>
                  <FaStepForward />
                </button>
              </div>
              
              <div className="progress-container">
                <span className="time-current">{formatTime(currentTime)}</span>
                <div 
                  className="progress-bar"
                  ref={progressRef}
                  onClick={handleProgressClick}
                  onMouseDown={handleProgressMouseDown}
                >
                  <div 
                    className="progress"
                    style={{ 
                      width: `${((isDragging ? dragTime : currentTime) / duration * 100) || 0}%`
                    }}
                  />
                </div>
                <span className="time-total">{formatTime(duration)}</span>
              </div>
            </div>
          )}

          <div className="player-right">
            <button 
              className={`like-btn ${isLiked ? 'active' : ''}`}
              onClick={handleLike}
            >
              <FaHeart />
            </button>
            
            <div className="volume-control">
              <button 
                className="volume-btn"
                onClick={toggleMute}
              >
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
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

          <audio
            ref={audioRef}
            src={currentSong?.audio}
            onEnded={playNext}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
        {isFullscreen && <FullscreenPlayer />}
      </div>
    </div>
  );
}

export default Player;
