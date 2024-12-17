import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaRandom, FaList, FaSyncAlt } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../context/FavoriteContext';
import { albums } from '../Home'; // 导入专辑数据
import './Player.css';

function Player() {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
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

  // 获取歌曲对应的专辑信息
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

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      
      const updateTime = () => setCurrentTime(audio.currentTime);
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
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, [currentSong, isPlaying]);

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
          >
            <FaStepBackward />
          </button>
          <button 
            className="play-pause"
            onClick={togglePlay}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button 
            onClick={handleNext}
            className="control-btn"
          >
            <FaStepForward />
          </button>
        </div>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ 
              width: duration ? `${(currentTime / duration) * 100}%` : '0%' 
            }}
          >
          </div>
          <span className="time-current">{formatTime(currentTime)}</span>
          <span className="time-total">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-right">
        <button 
          className={`like-btn ${isLiked ? 'active' : ''}`} 
          onClick={handleLike}
        >
          <FaHeart />
        </button>
        <button 
          className="mode-btn" 
          onClick={handlePlayMode}
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
