//最近播放
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecentPlays } from '../context/RecentPlayContext';
import BackButton from './BackButton';
import './RecentPlays.css';

function RecentPlays() {
  const navigate = useNavigate();
  const { recentPlays } = useRecentPlays();

  return (
    <div className="recent-plays-container">
      <BackButton />
      <h2>最近播放</h2>
      <div className="recent-plays-list">
        {recentPlays.length > 0 ? (
          recentPlays.map((song, index) => (
            <div 
              key={index}
              className="recent-play-item"
              onClick={() => {
                navigate(`/song/${encodeURIComponent(song.name)}`, {
                  state: {
                    song: song.name,
                    albumName: song.album,
                    albumCover: song.cover,
                    audio: song.audio
                  }
                });
              }}
            >
              <img src={song.cover} alt={song.name} className="recent-play-cover" />
              <div className="recent-play-info">
                <div className="recent-play-name">{song.name}</div>
                <div className="recent-play-album">{song.album}</div>
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

