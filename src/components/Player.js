import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaHeart, FaRedo } from 'react-icons/fa';
import { useFavorites } from '../context/FavoriteContext';
import { usePlayer } from '../context/PlayerContext';
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

  const { 
    name: song, 
    album: currentAlbumName, 
    cover: currentAlbumCover, 
    audio: audioUrl 
  } = currentSong || {};

  const handlePrevious = () => {
    if (songList && currentIndex !== undefined) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      switchSong('prev', currentIndex, songList, navigate, currentAlbumName, currentAlbumCover);
    }
  };

  const handleNext = () => {
    if (songList && currentIndex !== undefined) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      switchSong('next', currentIndex, songList, navigate, currentAlbumName, currentAlbumCover);
    }
  };

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setDuration(0);
      
      try {
        const defaultAudioPath = '/music/最伟大的作品.mp3';
        audioRef.current.src = defaultAudioPath;
        
        const handleLoadedMetadata = () => {
          setDuration(audioRef.current.duration);
          if (currentSong.autoPlay) {
            audioRef.current.play()
              .then(() => {
                setIsPlaying(true);
              })
              .catch(error => {
                console.error('自动播放失败:', error);
                setIsPlaying(false);
              });
          }
        };

        const handleError = (error) => {
          console.error('音频加载失败，使用默认音频:', error);
          if (audioRef.current.src !== defaultAudioPath) {
            audioRef.current.src = defaultAudioPath;
          }
          setIsPlaying(false);
        };

        audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.addEventListener('error', handleError);
        audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
        
        return () => {
          if (audioRef.current) {
            audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audioRef.current.removeEventListener('error', handleError);
            audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          }
        };
      } catch (error) {
        console.error('设置音频源失败:', error);
        setIsPlaying(false);
      }
    }
  }, [currentSong]);

  useEffect(() => {
    console.log('播放状态变化:', isPlaying);
    console.log('当前音频元素:', audioRef.current);
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handlePlayPause = async () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        await audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (!audioRef.current.src) {
          audioRef.current.src = '/music/最伟大的作品.mp3';
        }
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          try {
            await playPromise;
            setIsPlaying(true);
          } catch (error) {
            console.error('播放失败:', error);
            setIsPlaying(false);
            audioRef.current.src = '/music/最伟大的作品.mp3';
          }
        }
      }
    } catch (error) {
      console.error('播放控制失败:', error);
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration || !isFinite(duration)) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    
    if (isFinite(newTime)) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

  if (!song) {
    return renderDefaultPlayer();
  }

  return (
    <div className="bottom-player">
      <div className="player-left">
        <div className="player-album-cover">
          <img src={currentAlbumCover} alt={song} />
        </div>
        <div className="player-song-info">
          <div className="song-name">{song}</div>
          <div className="artist-name">周杰伦</div>
        </div>
      </div>

      <div className="player-center">
        <div className="control-buttons">
          <button onClick={handlePrevious}>
            <FaStepBackward />
          </button>
          <button className="play-btn" onClick={handlePlayPause}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={handleNext}>
            <FaStepForward />
          </button>
        </div>
        <div 
          className="progress-bar"
          onClick={handleProgressClick}
        >
          <div 
            className="progress" 
            style={{width: `${(currentTime / duration) * 100}%`}} 
          />
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
          onEnded={() => {
            setIsPlaying(false);
            handleNext();
          }}
        />
      )}
    </div>
  );
}

export default Player;

