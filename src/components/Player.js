import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaRedo, FaRandom } from 'react-icons/fa';
import { useFavorites } from '../context/FavoriteContext';
import { usePlayer } from '../context/PlayerContext';
import { useRecentPlays } from '../context/RecentPlaysContext';
import './Player.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { switchSong } from '../utils/songHandler';

function Player() {
  const { 
    currentSong, 
    isPlaying,
    setIsPlaying,
    setCurrentSong 
  } = usePlayer();

  const navigate = useNavigate();
  const location = useLocation();
  const { songList, currentIndex } = location.state || {};
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToRecentPlays } = useRecentPlays();
  
  const [playMode, setPlayMode] = useState('sequence');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const { 
    name: song, 
    album: currentAlbumName, 
    cover: currentAlbumCover, 
    audio: audioUrl 
  } = currentSong || {};

  const handlePrevious = () => {
    if (songList && currentIndex !== undefined) {
      const newIndex = playMode === 'random' 
        ? Math.floor(Math.random() * songList.length)
        : (currentIndex - 1 + songList.length) % songList.length;
      switchSong('prev', newIndex, songList, navigate, currentAlbumName, currentAlbumCover);
    }
  };

  const handleNext = () => {
    if (songList && currentIndex !== undefined) {
      const newIndex = playMode === 'random'
        ? Math.floor(Math.random() * songList.length)
        : (currentIndex + 1) % songList.length;
      switchSong('next', newIndex, songList, navigate, currentAlbumName, currentAlbumCover);
    }
  };

  // 切换播放模式
  const handlePlayModeChange = () => {
    setPlayMode(prevMode => prevMode === 'sequence' ? 'random' : 'sequence');
  };

  // 添加音频状态
  const [progress, setProgress] = useState(0);

  // 处理时间更新
  const handleTimeUpdate = (e) => {
    setProgress(e.target.currentTime);
  };

  // 处理音频加载
  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
  };

  // 处理播放/暂停
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

  // 处理进度条点击
  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
    const newTime = clickPosition * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  // 格式化时间
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="player">
      <div className="player-left">
        <div className="player-cover">
          {currentAlbumCover ? (
            <img src={currentAlbumCover} alt={song} />
          ) : (
            <div className="default-cover" />
          )}
        </div>
        <div className="player-song-info">
          <div className="song-name">{song || '未播放'}</div>
          <div className="artist-name">{currentAlbumName || '-'}</div>
        </div>
      </div>
      
      <div className="player-center">
        <div className="control-buttons">
          <button 
            onClick={handlePrevious}
            disabled={!currentSong}
          >
            <FaStepBackward />
          </button>
          <button 
            className="play-btn"
            onClick={togglePlay}
            disabled={!currentSong}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button 
            onClick={handleNext}
            disabled={!currentSong}
          >
            <FaStepForward />
          </button>
        </div>
      </div>

      <div className="player-right">
        <button 
          className={`like-btn ${isFavorite(song) ? 'active' : ''}`}
          onClick={() => currentSong && toggleFavorite(currentSong)}
          disabled={!currentSong}
        >
          <FaHeart />
        </button>
        <button 
          className={`mode-btn ${playMode === 'random' ? 'active' : ''}`}
          onClick={handlePlayModeChange}
          disabled={!currentSong}
        >
          {playMode === 'random' ? <FaRandom /> : <FaRedo />}
        </button>
      </div>

      {/* 添加进度条 */}
      <div className="progress-bar" onClick={handleProgressClick}>
        <div className="progress" style={{width: `${(progress / duration) * 100}%`}} />
        <span className="time-current">{formatTime(progress)}</span>
        <span className="time-total">{formatTime(duration)}</span>
      </div>

      {/* 添加音频元素 */}
      <audio
        ref={audioRef}
        src={currentSong?.audio}
        onTimeUpdate={(e) => setProgress(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}

export default Player;
