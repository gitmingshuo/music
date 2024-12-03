import React from 'react';
import { useNavigate } from 'react-router-dom';
import { albums } from '../Home';
import './Albums.css';
import BackButton from './BackButton';

function Albums() {
  const navigate = useNavigate();

  return (
    <div className="albums-page">
      <div className="albums-header">
        <BackButton />
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Albums;