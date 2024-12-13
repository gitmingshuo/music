import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaRandom } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';
import { useRecentPlays } from '../context/RecentPlaysContext';
import './Player.css';

function Player() {
  const { currentSong, isPlaying, setIsPlaying, playNext, playPrevious, isShuffle, toggleShuffle } = usePlayer();
  const { addToRecentPlays } = useRecentPlays();
  const audioRef = useRef(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (currentSong) {
      addToRecentPlays(currentSong);
    }
  }, [currentSong]);

  const togglePlay = async () => {
    if (!audioRef.current || !currentSong?.audio) return;
    try {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('播放出错:', error);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

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
          <button onClick={togglePlay} disabled={!currentSong}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={playNext} disabled={!currentSong}>
            <FaStepForward />
          </button>
        </div>
        <div className="progress-bar">
          {/* 这里需要根据实际进度更新 style.width 和显示当前时间与总时长 */}
          <div className="progress" style={{ width: '0%' }}></div>
          <span className="time-current">0:00</span>
          <span className="time-total">0:00</span>
        </div>
      </div>

      <div className="player-right">
        <button className="mode-btn" onClick={toggleShuffle} disabled={!currentSong}>
          <FaRandom style={{ color: isShuffle ? '#ff3a3a' : 'inherit' }} />
        </button>
        <button 
          className={`like-btn ${isLiked ? 'active' : ''}`} 
          onClick={toggleLike} 
          disabled={!currentSong}
        >
          <FaHeart />
        </button>
      </div>

      <audio
        ref={audioRef}
        src={currentSong?.audio}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}

export default Player;
