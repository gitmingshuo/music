import React from 'react';
import { useNavigate } from 'react-router-dom';
import { albums } from '../Home';
import './RecommendedPlaylists.css';

function RecommendedPlaylists() {
  const navigate = useNavigate();
  
  return (
    <div className="recommended-section">
      <h2 className="section-title">推荐歌单</h2>
      <div className="playlist-grid">
        {albums.slice(0, 6).map((album, index) => (
          <div 
            key={index}
            className="playlist-card"
            onClick={() => navigate(`/album/${album.name}`, { state: { album } })}
          >
            <div className="playlist-cover-wrapper">
              <img src={album.cover} alt={album.name} className="playlist-cover" />
              <div className="play-count">
                <span className="play-icon">▶</span>
                <span>{Math.floor(Math.random() * 100000)}</span>
              </div>
            </div>
            <div className="playlist-info">
              <h3 className="playlist-name">{album.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendedPlaylists;