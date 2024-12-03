import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoriteContext';
import { FaHeart } from 'react-icons/fa';
import BackButton from '../components/BackButton';
import { handleSongClick } from '../utils/songHandler';
import './Favorites.css';

function Favorites() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <BackButton />
        <h1>我喜欢的音乐</h1>
      </div>

      <div className="favorites-list">
        {favorites.map((song, index) => (
          <div 
            key={index} 
            className="favorite-item"
            onClick={() => handleSongClick(song, navigate)}
          >
            <img src={song.cover} alt={song.name} className="song-cover" />
            <div className="song-info">
              <span className="song-name">{song.name}</span>
              <span className="album-name">{song.album}</span>
            </div>
            <button 
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(song);
              }}
            >
              <FaHeart />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;