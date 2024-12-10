// 播放列表详情
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import './PlaylistDetail.css';

function PlaylistDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { playlist } = location.state || {};
  const { name, cover, songs } = playlist || {};
  const [songDurations, setSongDurations] = useState({});

  // 获取歌曲时长
  useEffect(() => {
    if (!songs) return;
    
    songs.forEach(song => {
      const audio = new Audio(`/music/最伟大的作品.mp3`);
      audio.addEventListener('loadedmetadata', () => {
        setSongDurations(prev => ({
          ...prev,
          [song]: formatDuration(audio.duration)
        }));
      });
    });
  }, [songs]);

  // 格式化时长
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleSongDoubleClick = (song, index) => {
    navigate(`/song/${encodeURIComponent(song)}`, {
      state: {
        song,
        audio: `/music/最伟大的作品.mp3`,
        albumName: name,
        albumCover: cover,
        songList: songs,
        currentIndex: index,
        autoPlay: true
      }
    });
  };

  return (
    <div className="playlist-detail-page">
      <div className="playlist-header">
        <BackButton />
        <div className="playlist-cover-container">
          <img src={cover} alt={name} className="playlist-cover" />
        </div>
        <div className="playlist-info">
          <h1>{name}</h1>
          <div className="playlist-stats">
            <span className="song-count">{songs?.length || 0} 首歌曲</span>
          </div>
        </div>
      </div>

      <div className="playlist-content">
        <button className="play-all-btn" onClick={() => handleSongDoubleClick(songs[0], 0)}>
          ▶ 播放全部
        </button>

        <div className="song-list">
          <div className="song-list-header">
            <div className="song-index">#</div>
            <div className="song-title">标题</div>
            <div className="song-duration">时长</div>
          </div>
          
          {songs?.map((song, index) => (
            <div 
              key={index} 
              className="song-item"
              onDoubleClick={() => handleSongDoubleClick(song, index)}
            >
              <div className="song-index">{index + 1}</div>
              <div className="song-title">
                <span className="song-name">{song}</span>
                <span className="song-artist">周杰伦</span>
              </div>
              <div className="song-duration">{songDurations[song] || '--:--'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlaylistDetail;