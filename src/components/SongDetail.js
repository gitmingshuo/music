import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useMusic, getLyricsPath } from '../context/MusicContext';
import './SongDetail.css';

function SongDetail() {
  const location = useLocation();
  const { currentSong, currentTime } = useMusic();
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [lyrics, setLyrics] = useState([]);
  const lyricsContainerRef = useRef(null);

  // 加载歌词
  useEffect(() => {
    const loadLyrics = async () => {
      if (!currentSong?.name) return;
      
      try {
        const response = await fetch(getLyricsPath(currentSong.name));
        if (!response.ok) {
          throw new Error('加载歌词失败');
        }
        const data = await response.json();
        setLyrics(data.lyrics || []);
      } catch (err) {
        console.error('加载歌词失败:', err);
        setLyrics([
          { time: 0, text: '暂无歌词' },
          { time: 1, text: '请欣赏音乐' }
        ]);
      }
    };

    loadLyrics();
  }, [currentSong]);

  // 更新当前歌词
  useEffect(() => {
    if (!lyrics.length) return;
    
    let index = lyrics.findIndex(lyric => lyric.time > currentTime) - 1;
    if (index < 0) index = 0;
    
    setCurrentLyricIndex(index);

    // 滚动到当前歌词
    if (lyricsContainerRef.current) {
      const activeLyric = lyricsContainerRef.current.querySelector('.active');
      if (activeLyric) {
        activeLyric.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentTime, lyrics]);

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
        <div className="lyrics-container" ref={lyricsContainerRef}>
          {lyrics.length > 0 ? (
            lyrics.map((lyric, index) => (
              <p 
                key={index}
                className={`lyric-line ${index === currentLyricIndex ? 'active' : ''}`}
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