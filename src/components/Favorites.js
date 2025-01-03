import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { FaHeart } from 'react-icons/fa';
import './Favorites.css';

function Favorites() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, addToPlaylist, getAlbumInfo, getAudioPath } = useMusic();
  const { user } = useAuth();

  if (!user) {
    return <div className="favorites-page">请先登录</div>;
  }

  const handleSongClick = async (song) => {
    try {
      let lyrics = null;
      try {
        const response = await fetch(`/static/lyrics/粉色海洋.json`);
        if (response.ok) {
          const data = await response.json();
          lyrics = data;
        }
      } catch (error) {
        console.warn('歌词加载失败，使用默认歌词:', error);
        lyrics = {
          lyrics: [
            { time: 0, text: '暂无歌词' },
            { time: 1, text: '请欣赏音乐' }
          ]
        };
      }

      const albumInfo = getAlbumInfo(song.name);
      const songWithInfo = {
        ...song,
        albumName: song.albumName || albumInfo.albumName,
        albumCover: song.cover || albumInfo.albumCover,
        lyrics: lyrics.lyrics,
        audio: getAudioPath(song.name)
      };

      addToPlaylist(songWithInfo);
      navigate(`/song/${encodeURIComponent(song.name)}`, {
        state: { song: songWithInfo }
      });
    } catch (error) {
      console.error('播放失败:', error);
      alert('暂时无法播放该歌曲，请稍后再试');
    }
  };

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1>我喜欢的音乐</h1>
      </div>
      <div className="favorites-list">
        {favorites.length === 0 ? (
          <p>还没有收藏任何歌曲</p>
        ) : (
          favorites.map((song, index) => {
            const albumInfo = getAlbumInfo(song.name);
            return (
              <div 
                key={index} 
                className="favorite-item"
                onClick={() => handleSongClick(song)}
              >
                <div className="song-cover">
                  <img 
                    src={song.cover || albumInfo.albumCover} 
                    alt={song.name}
                    onError={(e) => {
                      e.target.src = '/static/media/default-cover.jpg';
                    }}
                  />
                </div>
                <div className="song-info">
                  <span className="song-name">{song.name}</span>
                  <span className="album-name">
                    {song.albumName || albumInfo.albumName}
                  </span>
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
            );
          })
        )}
      </div>
    </div>
  );
}

export default Favorites;