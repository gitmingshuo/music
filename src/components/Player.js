import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaRedo } from 'react-icons/fa';
import { useFavorites } from '../context/FavoriteContext';
import { usePlayer } from '../context/PlayerContext';
import './Player.css';

function Player() {
  const { currentSong } = usePlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  
  const { isFavorite, toggleFavorite } = useFavorites();

  // 从 currentSong 中解构需要的数据
  const { name: song, album: albumName, cover: albumCover, audio: audioUrl } = currentSong || {};

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const renderDefaultPlayer = () => (
    <div className="bottom-player">
      <div className="player-left">
        <div className="player-album-cover">
          <div className="default-cover" />
        </div>
        <div className="player-song-info">
          <div className="song-name">未播放</div>
          <div className="artist-name">-</div>
        </div>
      </div>
      <div className="player-center">
        <div className="control-buttons">
          <button disabled><FaStepBackward /></button>
          <button className="play-btn" disabled><FaPlay /></button>
          <button disabled><FaStepForward /></button>
        </div>
        <div className="progress-bar">
          <div className="progress" style={{width: '0%'}} />
        </div>
      </div>
      <div className="player-right">
        <button className="like-btn" disabled><FaHeart /></button>
        <button className="loop-btn" disabled><FaRedo /></button>
      </div>
    </div>
  );

  useEffect(() => {
    if (currentSong?.autoPlay && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('自动播放失败:', error);
        });
    }
  }, [currentSong]);

  if (!song) {
    return renderDefaultPlayer();
  }

  return (
    <div className="bottom-player">
      <div className="player-left">
        <div className="player-album-cover">
          <img src={albumCover} alt={song} />
        </div>
        <div className="player-song-info">
          <div className="song-name">{song}</div>
          <div className="artist-name">周杰伦</div>
        </div>
      </div>

      <div className="player-center">
        <div className="control-buttons">
          <button><FaStepBackward /></button>
          <button className="play-btn" onClick={handlePlayPause}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button><FaStepForward /></button>
        </div>
        <div 
          className="progress-bar"
          onClick={handleProgressClick}
        >
          <div 
            className="progress" 
            style={{width: `${(currentTime / duration) * 100 || 0}%`}}
          />
          <span className="time-current">{formatTime(currentTime)}</span>
          <span className="time-total">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-right">
        <button 
          className={`like-btn ${currentSong && isFavorite(currentSong) ? 'active' : ''}`} 
          onClick={() => currentSong && toggleFavorite(currentSong)}
          disabled={!currentSong}
        >
          <FaHeart />
        </button>
        <button className="loop-btn">
          <FaRedo />
        </button>
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
}

export default Player;

