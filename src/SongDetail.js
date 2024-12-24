import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMusic } from './context/MusicContext';
import './SongDetail.css';

function SongDetail() {
  const location = useLocation();
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    currentTime, 
    duration,
    setIsPlaying
  } = useMusic();
  const [lyrics, setLyrics] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);

  useEffect(() => {
    // 加载歌词
    const loadLyrics = async () => {
      try {
        const response = await fetch(`/lyrics/${encodeURIComponent(currentSong?.name || '')}.json`);
        if (response.ok) {
          const data = await response.json();
          setLyrics(data.lyrics);
        } else {
          setLyrics([{ time: 0, text: "暂无歌词" }]);
        }
      } catch (error) {
        console.error('加载歌词失败:', error);
        setLyrics([{ time: 0, text: "暂无歌词" }]);
      }
    };

    if (currentSong) {
      loadLyrics();
    }
  }, [currentSong]);

  // 更新当前歌词
  useEffect(() => {
    if (!lyrics.length) return;
    
    const index = lyrics.findIndex((lyric, i) => {
      const nextTime = lyrics[i + 1]?.time ?? Infinity;
      return lyric.time <= currentTime && currentTime < nextTime;
    });
    
    if (index !== -1) {
      setCurrentLyricIndex(index);
    }
  }, [currentTime, lyrics]);

  // 添加播放控制相关的处理函数
  const handlePlayPause = () => {
    if (togglePlay) {
      togglePlay();
    }
  };

  const Comments = ({ songName }) => {
    const songComments = Comments[songName] || [];
    
    return (
      <div className="comments-section">
        <h2>评论区</h2>
        <div className="comments-container">
          {songComments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-avatar">
                <img src={comment.avatar} alt="avatar" />
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="username">{comment.username}</span>
                  <span className="time">{comment.time}</span>
                </div>
                <p className="comment-text">{comment.content}</p>
                <div className="comment-footer">
                  <button className="like-button">
                    <span className="like-icon">♥</span>
                    <span className="like-count">{comment.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!currentSong) {
    return <div className="song-detail-container">未找到歌曲信息</div>;
  }

  return (
    <div className="song-detail-container">
      <div className="song-header">
        <div className="song-title">
          <h1>{currentSong.name}</h1>
          <div className="song-meta">
            <span>专辑：{currentSong.album}</span>
            <span>歌手：周杰伦</span>
            <span>来源：心拓-喜欢的音乐</span>
          </div>
        </div>
      </div>

      <div className="song-content">
        <div className="vinyl-container">
          <div className="vinyl-arm"></div>
          <div className="vinyl-disc">
            <img src={currentSong.cover} alt={currentSong.name} className="vinyl-cover" />
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

      {/* 可以添加播放控制按钮 */}
      <div className="player-controls">
        <button onClick={handlePlayPause}>
          {isPlaying ? '暂停' : '播放'}
        </button>
      </div>

      <Comments songName={currentSong?.name} />
    </div>
  );
}

export default SongDetail;
