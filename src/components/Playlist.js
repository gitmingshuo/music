import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { FaPlay, FaTrash, FaEllipsisV } from 'react-icons/fa';
import './Playlist.css';

function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playlists, addToPlaylist, removeSongFromPlaylist, deletePlaylist } = useMusic();
  const { user } = useAuth();
  const [showOptions, setShowOptions] = useState(false);

  if (!user) {
    return <div className="playlist-page">请先登录</div>;
  }

  const playlist = playlists.find(p => p.id === id);
  
  if (!playlist) {
    return <div className="playlist-page">歌单不存在</div>;
  }

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      addToPlaylist(playlist.songs[0], playlist.songs);
    }
  };

  const handleDeletePlaylist = () => {
    if (window.confirm('确定要删除这个歌单吗？')) {
      deletePlaylist(playlist.id);
      navigate('/');
    }
  };

  const handleDeleteSong = (songName, e) => {
    e.stopPropagation();
    if (window.confirm(`确定要从歌单中删除 "${songName}" 吗？`)) {
      removeSongFromPlaylist(playlist.id, songName);
    }
  };

  const handleSongClick = (song) => {
    const fullPlaylist = playlist.songs.map(s => {
      return {
        name: typeof s === 'string' ? s : s.name,
        albumName: s.albumName || playlist.name,
        albumCover: s.albumCover || '/default-cover.jpg',
        audio: `/static/music/${encodeURIComponent(typeof s === 'string' ? s : s.name)}.mp3`
      };
    });
    
    addToPlaylist(song, fullPlaylist);
  };

  return (
    <div className="playlist-page">
      <div className="playlist-header">
        <div className="playlist-info">
          <h1>{playlist.name}</h1>
          <div className="playlist-meta">
            <span>{playlist.songs.length} 首歌</span>
          </div>
        </div>
        
        <div className="playlist-actions">
          {playlist.songs.length > 0 && (
            <button className="play-all-btn" onClick={handlePlayAll}>
              <FaPlay />
              播放全部
            </button>
          )}
          <button 
            className="more-options-btn"
            onClick={() => setShowOptions(!showOptions)}
          >
            <FaEllipsisV />
          </button>
          
          {showOptions && (
            <div className="options-menu">
              <button 
                className="delete-playlist-btn"
                onClick={handleDeletePlaylist}
              >
                <FaTrash />
                删除歌单
              </button>
            </div>
          )}
        </div>
      </div>

      {playlist.songs.length > 0 ? (
        <div className="song-list">
          {playlist.songs.map((song, index) => {
            const songName = typeof song === 'string' ? song : song.name;
            return (
              <div 
                key={index}
                className="song-item"
                onClick={() => handleSongClick(song)}
              >
                <span className="song-number">{index + 1}</span>
                <div className="song-info">
                  <span className="song-name">{songName}</span>
                  <span className="song-album">{song.albumName || '-'}</span>
                </div>
                <button 
                  className="delete-song-btn"
                  onClick={(e) => handleDeleteSong(songName, e)}
                >
                  <FaTrash />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-playlist">
          <p>歌单还没有歌曲</p>
          <p>去找找喜欢的音乐吧</p>
        </div>
      )}
    </div>
  );
}

export default Playlist; 