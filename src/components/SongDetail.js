import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMusic } from './context/MusicContext';
import './SongDetail.css';

function SongDetail() {
  const location = useLocation();
  const { 
    currentSong, 
    isPlaying, 
    currentLyricIndex 
  } = useMusic();
  const lyricsContainerRef = useRef(null);
  const [loadedLyrics, setLoadedLyrics] = useState([]);

  // 加载歌词
  useEffect(() => {
    const loadLyrics = async () => {
      try {
        const response = await fetch(`/static/lyrics/${encodeURIComponent(currentSong?.name)}.json`);
        if (response.ok) {
          const data = await response.json();
          console.log('加载的歌词:', data); // 调试用
          setLoadedLyrics(data.lyrics || []);
        } else {
          throw new Error('加载歌词失败');
        }
      } catch (error) {
        console.error('加载歌词失败:', error);
        // 使用默认歌词
        setLoadedLyrics([
          { time: 0, text: '暂无歌词' },
          { time: 1, text: '请欣赏音乐' }
        ]);
      }
    };

    if (currentSong) {
      loadLyrics();
    }
  }, [currentSong]);

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
          {loadedLyrics.length > 0 ? (
            loadedLyrics.map((lyric, index) => (
              <p 
                key={index}
                className={`lyric-line ${index === currentLyricIndex ? 'active' : ''}`}
              >
                {lyric.text}
              </p>
            ))
          ) : (
            <p className="no-lyrics">暂无歌词</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SongDetail; 