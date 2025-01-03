import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useMusic, getLyricsPath } from '../context/MusicContext';
import './SongDetail.css';

function SongDetail() {
  const location = useLocation();
  const { currentSong, currentTime, currentLyrics, currentLyricIndex } = useMusic();
  const [lyrics, setLyrics] = useState([]);
  const lyricsRef = useRef(null);

  // 加载歌词
  useEffect(() => {
    const loadLyrics = async () => {
      try {
        const response = await fetch(`/static/lyrics/粉色海洋.json`);
        if (response.ok) {
          const data = await response.json();
          console.log('加载的歌词:', data); // 调试用
          setLyrics(data.lyrics || []);
        } else {
          throw new Error('加载歌词失败');
        }
      } catch (error) {
        console.error('加载歌词失败:', error);
        setLyrics([
          { time: 0, text: '暂无歌词' },
          { time: 1, text: '请欣赏音乐' }
        ]);
      }
    };

    loadLyrics();
  }, [currentSong?.name]);

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
        <div className="lyrics-container" ref={lyricsRef}>
          {currentLyrics.length > 0 ? (
            currentLyrics.map((lyric, index) => (
              <p 
                key={index}
                className={index === currentLyricIndex ? 'active' : ''}
              >
                {lyric.text}
              </p>
            ))
          ) : (
            <p className="lyric-line">暂无歌词</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SongDetail; 