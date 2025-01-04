import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMusic } from './context/MusicContext';
import './SongDetail.css';
  
function SongDetail() {
  const location = useLocation();
  const { 
    currentSong, 
    isPlaying, 
    currentLyrics: lyrics,
    currentLyricIndex 
  } = useMusic();
  const lyricsContainerRef = useRef(null);

  // 只保留歌词滚动逻辑
  useEffect(() => {
    if (lyricsContainerRef.current) {
      const activeLyric = lyricsContainerRef.current.querySelector('.active');
      if (activeLyric) {
        activeLyric.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentLyricIndex]);

  return (
    <div className="song-detail-container">
      <div className="song-background">
        <img 
          src={currentSong?.albumCover || '/default-cover.jpg'} 
          alt={currentSong?.name}
          onError={(e) => {
            e.target.src = '/default-cover.jpg';
          }}
        />
      </div>
      <div className="song-content">
        <div className="vinyl-container">
          <div className={`vinyl-disc ${isPlaying ? 'playing' : ''}`}>
            <img 
              src={currentSong?.albumCover || '/default-cover.jpg'} 
              alt={currentSong?.name}
              onError={(e) => {
                e.target.src = '/default-cover.jpg';
              }}
            />
          </div>
          <div className={`vinyl-arm ${isPlaying ? 'playing' : ''}`} />
        </div>
        
        <div className="lyrics-container" ref={lyricsContainerRef}>
          {lyrics.map((lyric, index) => (
            <p 
              key={index}
              className={`lyric-line ${index === currentLyricIndex ? 'active' : ''}`}
            >
              {lyric.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SongDetail;
