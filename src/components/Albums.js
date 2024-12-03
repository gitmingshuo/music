import React from 'react';
import { useNavigate } from 'react-router-dom';
import { albums } from '../Home';
import './Albums.css';

function Albums() {
  const navigate = useNavigate();

  return (
    <div className="albums-page">
      <div className="albums-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <span>←</span> 返回
        </button>
        <h1>专辑</h1>
      </div>

      <div className="albums-grid">
        {albums.map((album, index) => (
          <div 
            key={index} 
            className="album-card"
            onClick={() => navigate(`/album/${album.name}`, { state: { album } })}
          >
            <img 
              src={album.cover} 
              alt={album.name} 
              className="album-cover"
            />
            <div className="album-info">
              <h3>{album.name}</h3>
              <p>{album.year}</p>
            </div>
            <div className="play-count">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5.14v14.72L19 12 8 5.14z"/>
              </svg>
              {album.playCount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Albums;