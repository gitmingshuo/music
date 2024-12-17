import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlayer } from './context/PlayerContext';
import BackButton from './components/BackButton';
import './AlbumDetail.css';

function AlbumDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToPlaylist } = usePlayer();
  const album = location.state?.album;

  const handleSongClick = (song) => {
    const defaultAudio = '/music/说好不哭.mp3';
    
    const songInfo = {
      name: song,
      albumName: album.name,
      albumCover: album.cover,
      audio: defaultAudio
    };
    
    const playlist = album.songs.map(s => ({
      name: s,
      albumName: album.name,
      albumCover: album.cover,
      audio: defaultAudio
    }));
    
    addToPlaylist(songInfo, playlist);
    
    navigate(`/song/${encodeURIComponent(song)}`, { 
      state: { 
        song: songInfo,
        album: album
      } 
    });
  };

  if (!album) return null;

  return (
    <div className="album-detail-container">
      <img 
        src={album.cover} 
        alt={album.name} 
        className="album-background"
      />
      
      <div className="album-content">
        <BackButton />
        
        <div className="album-header">
          <img 
            src={album.cover} 
            alt={album.name} 
            className="album-detail-cover"
          />
          
          <div className="album-info">
            <span className="album-type">专辑</span>
            <h1 className="album-title">{album.name}</h1>
            <div className="album-meta">
              <span>发行年份: {album.year}</span>
              <span>•</span>
              <span>{album.songs.length} 首歌</span>
            </div>
            <p className="album-description">{album.description}</p>
          </div>
        </div>

        <div className="songs-section">
          <div className="songs-header">
            <div>#</div>
            <div>歌曲名</div>
          </div>
          
          <div className="song-list">
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
      </div>
    </div>
  );
}

export default AlbumDetail;
