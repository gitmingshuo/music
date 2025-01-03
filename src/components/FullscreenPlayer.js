import React, { useRef, useEffect } from 'react';
import { useMusic } from '../context/MusicContext';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaHeart } from 'react-icons/fa';
import './FullscreenPlayer.css';

function FullscreenPlayer() {
  const { 
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    currentTime,
    duration,
    handleSeek,
    toggleFullscreen,
    favorites,
    toggleFavorite,
    currentLyrics,
    currentLyricIndex,
    getAlbumInfo
  } = useMusic();

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const isLiked = favorites.some(fav => fav.name === currentSong?.name);
  const albumInfo = currentSong?.name ? getAlbumInfo(currentSong.name) : null;

  const lyricsRef = useRef(null);

  useEffect(() => {
    if (lyricsRef.current && currentLyricIndex >= 0) {
      const lyricElements = lyricsRef.current.children;
      if (lyricElements[currentLyricIndex]) {
        lyricElements[currentLyricIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentLyricIndex]);

  return (
    <div className="fullscreen-player">
      <div className="fullscreen-background" style={{
        backgroundImage: `url(${albumInfo?.albumCover || '/default-cover.jpg'})`
      }} />
      
      <div className="fullscreen-content">
        <div className="fullscreen-header">
          <button className="close-fullscreen" onClick={toggleFullscreen}>×</button>
        </div>

        <div className="fullscreen-main">
          <div className="album-cover-large">
            <img 
              src={albumInfo?.albumCover || '/default-cover.jpg'} 
              alt={currentSong?.name} 
            />
          </div>

          <div className="song-info-large">
            <h2>{currentSong?.name}</h2>
            <p>{albumInfo?.albumName || '-'}</p>
          </div>

          <div className="lyrics-display" ref={lyricsRef}>
            {currentLyrics.map((lyric, index) => (
              <p 
                key={index}
                className={index === currentLyricIndex ? 'active' : ''}
              >
                {lyric.text}
              </p>
            ))}
          </div>

          <div className="controls-large">
            <div className="progress-bar-large">
              <span className="time-current">{formatTime(currentTime)}</span>
              <div className="progress-bar-container">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                />
              </div>
              <span className="time-total">{formatTime(duration)}</span>
            </div>

            <div className="control-buttons-large">
              <button onClick={() => toggleFavorite(currentSong)} className={`like-btn ${isLiked ? 'active' : ''}`}>
                <FaHeart />
              </button>
              <button onClick={playPrevious}>
                <FaStepBackward />
              </button>
              <button className="play-pause" onClick={togglePlay}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={playNext}>
                <FaStepForward />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FullscreenPlayer; 