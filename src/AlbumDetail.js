import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFavorites } from './context/FavoriteContext';
import { FaHeart, FaPlay } from 'react-icons/fa';
import { albums } from './Home';
import { handleSongClick } from './utils/songHandler';
import BackButton from './components/BackButton';
import './AlbumDetail.css';

function AlbumDetail() {
  const { albumName } = useParams();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  
  // 获取专辑信息
  const album = albums.find(a => a.name === decodeURIComponent(albumName));
  
  if (!album) {
    return (
      <div className="album-detail-page">
        <BackButton />
        <div className="error-message">专辑不存在</div>
      </div>
    );
  }

  // 检查歌曲是否在收藏列表中
  const isFavorite = (songName) => {
    return favorites.some(fav => fav.name === songName && fav.album === album.name);
  };

  return (
    <div className="album-detail-page">
      <div className="album-header">
        <BackButton />
        <h1>专辑详情</h1>
      </div>
      
      {/* 专辑信息区域 */}
      <div className="album-info">
        <div className="album-cover-container">
          <img src={album.cover} alt={album.name} className="album-cover" />
        </div>
        <div className="album-details">
          <h2>{album.name}</h2>
          <p className="album-artist">周杰伦</p>
          <p className="album-desc">发行日期：{album.releaseDate || '未知'}</p>
        </div>
      </div>

      {/* 歌曲列表 */}
      <div className="song-list">
        <h3>歌曲列表</h3>
        {album.songs.map((songName, index) => {
          const song = {
            name: songName,
            album: album.name,
            cover: album.cover
          };
          
          return (
            <div 
              key={index}
              className="song-item"
              onClick={() => handleSongClick(song, navigate)}
            >
              <div className="song-index">{(index + 1).toString().padStart(2, '0')}</div>
              <div className="song-info">
                <div className="song-name">{songName}</div>
              </div>
              <div className="song-actions">
                <button 
                  className={`favorite-btn ${isFavorite(songName) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(song);
                  }}
                >
                  <FaHeart />
                </button>
                <button className="play-btn">
                  <FaPlay />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AlbumDetail;
