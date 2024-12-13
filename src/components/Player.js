import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaRandom, FaList, FaSyncAlt } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../context/FavoriteContext';
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

  useEffect(() => {
    if (currentSong) {
      const isFavorited = favorites.some(
        fav => fav.name === currentSong.name
      );
      setIsLiked(isFavorited);
    }
  }, [currentSong, favorites]);

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

  const handleLike = () => {
    if (currentSong) {
      toggleFavorite({
        name: currentSong.name,
        album: currentSong.albumName,
        cover: currentSong.albumCover,
        audio: currentSong.audio
      });
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, []);

  return (
    <div className="player">
      <div className="player-left">
        <div className="player-cover">
          {currentSong?.albumCover ? (
            <img src={currentSong.albumCover} alt={currentSong.name} />
          ) : (
            <div className="default-cover" />
          )}
        </div>
        <div className="player-song-info">
          <div className="song-name">{currentSong?.name || '未播放'}</div>
          <div className="artist-name">{currentSong?.albumName || '-'}</div>
        </div>
      </div>
      
      <div className="player-center">
        <div className="control-buttons">
          <button onClick={playPrevious} disabled={!currentSong}>
            <FaStepBackward />
          </button>
          <button 
            className="play-pause"
            onClick={togglePlay} 
            disabled={!currentSong}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={playNext} disabled={!currentSong}>
            <FaStepForward />
          </button>
        </div>
        <div className="progress-bar">
          <div className="progress" 
            style={{ width: `${(currentTime / duration) * 100}%` }}>
          </div>
          <span className="time-current">{formatTime(currentTime)}</span>
          <span className="time-total">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-right">
        <button 
          className={`like-btn ${isLiked ? 'active' : ''}`} 
          onClick={handleLike}
          disabled={!currentSong}
        >
          <FaHeart />
        </button>
        <button 
          className="mode-btn" 
          onClick={togglePlayMode}
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
