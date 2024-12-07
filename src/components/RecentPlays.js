//最近播放
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecentPlays } from '../context/RecentPlayContext';
import BackButton from '../components/BackButton';
import { handleSongClick } from '../utils/songHandler';
import './RecentPlays.css';

function RecentPlays() {
  const navigate = useNavigate();
  const { recentPlays } = useRecentPlays();

  return (
    <div className="recent-plays-page">
      <div className="recent-plays-header">
        <BackButton />
        <h1>最近播放</h1>
      </div>

      <div className="recent-plays-list">
        {recentPlays.length > 0 ? (
          recentPlays.map((song, index) => (
            <div 
              key={index} 
              className="recent-play-item"
              onClick={() => handleSongClick(song, navigate)}
            >
              <img src={song.cover} alt={song.name} className="song-cover" />
              <div className="song-info">
                <span className="song-name">{song.name}</span>
                <span className="album-name">{song.album}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-message">暂无播放记录</div>
        )}
      </div>
    </div>
  );
}

export default RecentPlays;