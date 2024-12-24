//用于展示音乐专辑列表页面。
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { albums } from '../Home';
import './Albums.css';

function Albums() {
  const navigate = useNavigate();
  
  return (
    <div className="albums-container">
      <div className="albums-header">
        <h1>专辑</h1>
      </div>

      <div className="albums-list">
        {albums.map((album, index) => (
          <div 
            key={index} 
            className="album-item"
            onClick={() => navigate(`/album/${album.name}`, { state: { album } })}
          >
            <div className="album-cover-wrapper">
              <img 
                src={album.cover} 
                alt={album.name} 
                className="album-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.src = '/default-album-cover.jpg';
                }}
              />
            </div>
            <div className="album-title">
              {album.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Albums;

