import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaRedo } from 'react-icons/fa';
import { useFavorites } from '/Users/admin/my-website/src/context/FavoriteContext.js';
import './SongDetail.css';

function SongDetail() {
  const location = useLocation();
  const { song, albumName, albumCover, audio: audioUrl } = location.state || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const currentSong = {
    name: song,
    album: albumName,
    cover: albumCover,
    audio: audioUrl
  };

  // 添加自动播放效果
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.log('自动播放失败:', error);
      });
    }
  }, []);

  // 格式化时间
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // 更新进度条
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  // 播放/暂停控制
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

  // 处理收藏
  const handleLike = () => {
    toggleFavorite(currentSong);
  };

  return (
    <div className="song-detail-container">
      <div className="song-header">
        <div className="song-title">
          <h1>{song}</h1>
          <div className="song-meta">
            <span>专辑：{albumName}</span>
            <span>歌手：周杰伦</span>
            <span>来源：心拓-喜欢的音乐</span>
          </div>
        </div>
        <div className="song-tabs">
          <span className="active">歌词</span>
          <span>百科</span>
          <span>相似推荐</span>
        </div>
      </div>

      <div className="song-content">
        {/* 左侧唱片区 */}
        <div className="vinyl-container">
          <div className="vinyl-arm"></div>
          <div className="vinyl-disc">
            <img src={albumCover} alt={song} className="vinyl-cover" />
          </div>
        </div>

        {/* 右侧歌词区 */}
        <div className="lyrics-container">
          <div className="lyrics-scroll">
            <p>暂无歌词</p>
          </div>
        </div>
      </div>

      {/* 底部播放控制栏 */}
      <div className="player-controls">
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{width: `${(currentTime / duration) * 100 || 0}%`}}
          ></div>
          <span className="time-current">{formatTime(currentTime)}</span>
          <span className="time-total">{formatTime(duration)}</span>
        </div>
        
        <div className="control-buttons">
          <button 
            className={`like-btn ${isFavorite(currentSong) ? 'active' : ''}`} 
            onClick={handleLike}
          >
            <FaHeart />
          </button>
          <button>
            <FaStepBackward />
          </button>
          <button className="play-btn" onClick={handlePlayPause}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button>
            <FaStepForward />
          </button>
          <button className="loop-btn">
            <FaRedo />
          </button>
        </div>
      </div>

      {/* 音频元素添加事件监听 */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}

export default SongDetail;
