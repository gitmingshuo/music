import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaRandom, FaList, FaSyncAlt } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../context/FavoriteContext';
import { albums } from '../Home';
import './Player.css';

function Player() {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const { 
    currentSong, 
    isPlaying, 
    setIsPlaying,
    playNext,
    playPrevious,
    playMode,
    togglePlayMode 
  } = usePlayer();
  
  const { favorites, toggleFavorite } = useFavorites();
  const [isLiked, setIsLiked] = useState(false);

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
      const isFavorited = favorites.some(
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
      toggleFavorite({
        name: currentSong.name,
      });
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

  return (
    <div className="player" onClick={e => e.stopPropagation()}>
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
      </div>

      <div className="player-right">
        <button 
          className={`like-btn ${isLiked ? 'active' : ''}`} 
          onClick={handleLike}
          aria-label={isLiked ? "取消收藏" : "收藏"}
          disabled={!currentSong}
        >
          <FaHeart />
        </button>
        <button 
          className="mode-btn" 
          onClick={handlePlayMode}
          aria-label={`播放模式: ${playMode}`}
          disabled={!currentSong}
        >
          {playMode === 'shuffle' ? <FaRandom /> : 
           playMode === 'loop' ? <FaSyncAlt /> : 
           <FaList />}
        </button>
      </div>

      <audio
        ref={audioRef}
        src={currentSong?.audio}
        onEnded={playNext}
      />
    </div>
  );
}

export default Player;
