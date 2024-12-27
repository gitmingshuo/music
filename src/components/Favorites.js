import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { FaHeart } from 'react-icons/fa';
import { albums } from '../Home';
import './Favorites.css';

function Favorites() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, addToPlaylist } = useMusic();

  // 确保 favorites 是数组
  const favoritesList = Array.isArray(favorites) ? favorites : [];

  const getSongAlbumInfo = (songName) => {
    for (const album of albums) {
      if (album.songs.includes(songName)) {
        return {
          albumName: album.name,
          albumCover: album.cover
        };
      }
    }
    return null;
  };

  const handleSongClick = (songName) => {
    const albumInfo = getSongAlbumInfo(songName);
    if (albumInfo) {
      const songInfo = {
        name: songName,
        albumName: albumInfo.albumName,
        albumCover: albumInfo.albumCover,
        audio: `/music/${encodeURIComponent(songName)}.mp3`
      };
      
      const album = albums.find(a => a.name === albumInfo.albumName);
      if (album) {
        const playlist = album.songs.map(s => ({
          name: s,
          albumName: album.name,
          albumCover: album.cover,
          audio: `/music/${encodeURIComponent(s)}.mp3`
        }));
        
        addToPlaylist(songInfo, playlist);
      }
    }
  };

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1>我喜欢的音乐</h1>
      </div>

      <div className="favorites-list">
        {favoritesList.length === 0 ? (
          <p>还没有收藏任何歌曲</p>
        ) : (
          favoritesList.map((favorite, index) => {
            const songName = typeof favorite === 'string' ? favorite : favorite.name;
            const albumInfo = getSongAlbumInfo(songName);
            
            return (
              <div 
                key={index} 
                className="favorite-item"
                onClick={() => handleSongClick(songName)}
              >
                <div className="song-cover">
                  {albumInfo?.albumCover ? (
                    <img src={albumInfo.albumCover} alt={songName} />
                  ) : (
                    <div className="default-cover">
                      {songName[0]}
                    </div>
                  )}
                </div>
                <div className="song-info">
                  <span className="song-name">{songName}</span>
                  <span className="album-name">{albumInfo?.albumName || '未知专辑'}</span>
                </div>
                <button 
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(songName);
                  }}
                >
                  <FaHeart />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Favorites;