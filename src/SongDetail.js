import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { usePlayer } from './context/PlayerContext';
import './SongDetail.css';

function SongDetail() {
  const { addToPlaylist } = usePlayer();
  const location = useLocation();
  const { 
    song, 
    albumName, 
    albumCover, 
    audio: audioUrl,
    songList,
    currentIndex 
  } = location.state || {};
  const [lyrics, setLyrics] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const currentSongRef = useRef(null);

  // 加载歌词
  useEffect(() => {
    // 直接加载默认歌词文件
    fetch('/lyrics/default.json')
      .then(response => response.json())
      .then(data => {
        console.log('成功加载默认歌词');
        setLyrics(data.lyrics);
      })
      .catch(error => {
        console.error('加载歌词失败:', error);
        setLyrics([{ time: 0, text: "暂无歌词" }]);
      });
  }, []);

  // 更新当前歌词
  useEffect(() => {
    if (!lyrics.length) return;
    
    const updateLyric = (currentTime) => {
      const index = lyrics.findIndex((lyric, i) => {
        const nextTime = lyrics[i + 1]?.time ?? Infinity;
        return lyric.time <= currentTime && currentTime < nextTime;
      });
      
      if (index !== -1) {
        setCurrentLyricIndex(index);
      }
    };
    
    const audio = document.querySelector('audio');
    if (audio) {
      const handleTimeUpdate = (e) => updateLyric(e.target.currentTime);
      audio.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [lyrics]);

  // 设置当前歌曲
  useEffect(() => {
    if (song && albumName && albumCover && audioUrl) {
      const songData = {
        name: song,
        album: albumName,
        cover: albumCover,
        audio: audioUrl
      };
      
      // 如果有歌曲列表，使用完整列表
      if (songList && songList.length > 0) {
        const fullPlaylist = songList.map(s => ({
          name: s,
          album: albumName,
          cover: albumCover,
          audio: `/music/${encodeURIComponent(s)}.mp3`
        }));
        
        // 使用 addToPlaylist 替代 setCurrentSong
        if (JSON.stringify(songData) !== JSON.stringify(currentSongRef.current)) {
          addToPlaylist(songData, fullPlaylist);
          currentSongRef.current = songData;
        }
      } else {
        // 如果没有列表，只添加当前歌曲
        if (JSON.stringify(songData) !== JSON.stringify(currentSongRef.current)) {
          addToPlaylist(songData, [songData]);
          currentSongRef.current = songData;
        }
      }
    }
  }, [song, albumName, albumCover, audioUrl, songList, addToPlaylist]);

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
      </div>

      <div className="song-content">
        <div className="vinyl-container">
          <div className="vinyl-arm"></div>
          <div className="vinyl-disc">
            <img src={albumCover} alt={song} className="vinyl-cover" />
          </div>
        </div>

        <div className="lyrics-container">
          <div className="lyrics-scroll">
            {lyrics.map((lyric, index) => (
              <p 
                key={index}
                className={index === currentLyricIndex ? 'active' : ''}
              >
                {lyric.text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SongDetail;
