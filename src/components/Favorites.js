import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoriteContext';
import { usePlayer } from '../context/PlayerContext';
import { FaHeart } from 'react-icons/fa';
import BackButton from '../components/BackButton';
import { albums } from '../Home'; // 导入专辑数据
import './Favorites.css';

function Favorites() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToPlaylist } = usePlayer();

  // 获取歌曲对应的专辑信息
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

  const handleSongClick = (song) => {
    const albumInfo = getSongAlbumInfo(song.name);
    if (albumInfo) {
      // 构建完整的歌曲信息
      const songInfo = {
        name: song.name,
        albumName: albumInfo.albumName,
        albumCover: albumInfo.albumCover,
        audio: `/music/${encodeURIComponent(song.name)}.mp3`
      };
      
      // 找到对应的专辑
      const album = albums.find(a => a.name === albumInfo.albumName);
      if (album) {
        // 构建播放列表
        const playlist = album.songs.map(s => ({
          name: s,
          albumName: album.name,
          albumCover: album.cover,
          audio: `/music/${encodeURIComponent(s)}.mp3`
        }));
        
        // 添加到播放列表并播放
        addToPlaylist(songInfo, playlist);
      }
    }
  };

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <BackButton />
        <h1>我喜欢的音乐</h1>
      </div>

      <div className="favorites-list">
        {favorites.map((song, index) => {
          const albumInfo = getSongAlbumInfo(song.name);
          return (
            <div 
              key={index} 
              className="favorite-item"
              onClick={() => handleSongClick(song)}
            >
              <div className="song-cover">
                {albumInfo?.albumCover ? (
                  <img src={albumInfo.albumCover} alt={song.name} />
                ) : (
                  <div className="default-cover">
                    {song.name[0]}
                  </div>
                )}
              </div>
              <div className="song-info">
                <span className="song-name">{song.name}</span>
                <span className="album-name">{albumInfo?.albumName || '未知专辑'}</span>
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
        })}
      </div>
    </div>
  );
}

export default Favorites;