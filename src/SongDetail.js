import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useMusic } from './context/MusicContext';
import './SongDetail.css';
import { motion } from 'framer-motion';

function SongDetail() {
  const { songName } = useParams();
  const { currentSong, isPlaying, audioRef } = useMusic();
  const [lyrics, setLyrics] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const lyricsContainerRef = useRef(null);

  useEffect(() => {
    const loadLyrics = async () => {
      if (!currentSong?.name) return;
      
      try {
        const response = await fetch(`/lyrics/${encodeURIComponent(currentSong.name)}.json`);
        if (!response.ok) {
          throw new Error('加载歌词失败');
        }
        const data = await response.json();
        setLyrics(data.lyrics || []);
      } catch (err) {
        console.error('加载歌词失败:', err);
        setLyrics([{ time: 0, text: '暂无歌词' }]);
      }
    };

    loadLyrics();
  }, [currentSong]);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (!audioRef.current || !lyrics.length) return;

      const currentTime = audioRef.current.currentTime;
      let index = lyrics.findIndex((lyric, i) => {
        const nextLyric = lyrics[i + 1];
        if (!nextLyric) return i === lyrics.length - 1;
        return currentTime >= lyric.time && currentTime < nextLyric.time;
      });

      if (index !== -1 && index !== currentLyricIndex) {
        setCurrentLyricIndex(index);
        const lyricElement = document.querySelector(`.lyric-line:nth-child(${index + 1})`);
        if (lyricElement && lyricsContainerRef.current) {
          lyricsContainerRef.current.scrollTo({
            top: lyricElement.offsetTop - lyricsContainerRef.current.clientHeight / 2,
            behavior: 'smooth'
          });
        }
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [lyrics, currentLyricIndex, audioRef]);

  if (!currentSong) {
    return (
      <div className="song-detail-container">
        <div className="no-song">暂无播放歌曲</div>
      </div>
    );
  }

  return (
    <motion.div 
      className="song-detail-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="song-background">
        <img src={currentSong.albumCover} alt={currentSong.name} />
      </div>
      
      <div className="song-content">
        <div className="vinyl-container">
          <div className={`vinyl-arm ${isPlaying ? 'playing' : ''}`}></div>
          <div className={`vinyl-disc ${isPlaying ? 'playing' : ''}`}>
            <img src={currentSong.albumCover} alt={currentSong.name} />
          </div>
        </div>

        <div className="lyrics-container">
          <div className="lyrics-content" ref={lyricsContainerRef}>
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
              <p className="no-lyrics">暂无歌词</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SongDetail;
