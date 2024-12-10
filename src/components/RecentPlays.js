import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecentPlays } from '../context/RecentPlaysContext';
import BackButton from './BackButton';
import './RecentPlays.css';

function RecentPlays() {
  const navigate = useNavigate();
  const { recentPlays, clearRecentPlays } = useRecentPlays();

  const handleSongDoubleClick = (song) => {
    navigate(`/song/${encodeURIComponent(song.name)}`, {
      state: {
        song: song.name,
        audio: `/music/最伟大的作品.mp3`,
        albumName: song.album,
        albumCover: song.cover,
        autoPlay: true
      }
    });
  };

  return (
    <div className="recent-plays-page">
      <div className="recent-plays-header">
        <BackButton />
        <h1>最近播放</h1>
        {recentPlays.length > 0 && (
          <button 
            onClick={clearRecentPlays} 
            className="clear-history-btn"
          >
            清空播放记录
          </button>
        )}
      </div>
      <div className="recent-plays-list">
        {recentPlays.length === 0 ? (
          <p>暂无播放记录</p>
        ) : (
          recentPlays.map((song, index) => (
            <div 
              key={index} 
              className="recent-play-item"
              onDoubleClick={() => handleSongDoubleClick(song)}
            >
              <img src={song.cover} alt={song.name} className="song-cover" />
              <div className="song-info">
                <span className="song-name">{song.name}</span>
                <span className="album-name">{song.album}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecentPlays;
