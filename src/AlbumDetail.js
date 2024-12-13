import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePlayer } from './context/PlayerContext';
import BackButton from './components/BackButton';
import './AlbumDetail.css';

function AlbumDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToPlaylist } = usePlayer();
  const album = location.state?.album;
  
  console.log('专辑信息:', album);

  const handleSongClick = async (song) => {
    try {
      // 构建完整的歌曲信息
      const songInfo = {
        name: song,
        albumName: album.name,
        albumCover: album.cover,
        audio: `/music/${encodeURIComponent(song)}.mp3`
      };
      
      // 构建当前专辑的播放列表
      const playlist = album.songs.map(s => ({
        name: s,
        albumName: album.name,
        albumCover: album.cover,
        audio: `/music/${encodeURIComponent(s)}.mp3`
      }));
      
      // 添加到播放列表并播放
      addToPlaylist(songInfo, playlist);
      
    } catch (error) {
      console.error('播放歌曲时出错:', error);
    }
  };

  if (!album) {
    return <div>未找到专辑信息</div>;
  }

  return (
    <div className="album-detail-container">
      <img 
        src={album.cover} 
        alt={album.name} 
        className="album-background"
      />
      <BackButton />
      
      <div className="album-info">
        <img src={album.cover} alt={album.name} className="album-cover" />
        <div className="album-text">
          <h1>{album.name}</h1>
          <p className="album-year">发行年份: {album.year}</p>
          <p className="album-description">{album.description}</p>
        </div>
      </div>
      
      <div className="song-list">
        <h2>专辑歌曲</h2>
        {album.songs.map((song, index) => (
          <div 
            key={index}
            className="song-item"
            onClick={() => handleSongClick(song)}
          >
            <span className="song-number">{index + 1}</span>
            <span className="song-name">{song}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlbumDetail;
