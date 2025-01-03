import React from 'react';
import { useParams } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { FaPlay } from 'react-icons/fa';
import AddToPlaylistButton from './AddToPlaylistButton';
import './Playlist.css';

function Playlist() {
  const { id } = useParams();
  const { playlists, addToPlaylist, removeSongFromPlaylist } = useMusic();
  const { user } = useAuth();

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

  const handleSongClick = (song) => {
    // 创建当前歌单的完整播放列表
    const fullPlaylist = playlist.songs.map(s => {
      return {
        name: typeof s === 'string' ? s : s.name,
        albumName: s.albumName || playlist.name,
        albumCover: s.albumCover || '/default-cover.jpg',
        audio: s.audio || `/music/${encodeURIComponent(s.name || s)}.mp3`
      };
    });
    
    addToPlaylist(song, fullPlaylist);
  };

  return (
    <div className="playlist-page">
      <div className="playlist-header">
        <h1>{playlist.name}</h1>
        <div className="playlist-info">
          <span>{playlist.songs.length} 首歌</span>
        </div>
      </div>

      {playlist.songs.length > 0 ? (
        <>
          <div className="playlist-controls">
            <button className="play-all-btn" onClick={handlePlayAll}>
              <FaPlay />
              播放全部
            </button>
          </div>
          
          <div className="song-list">
            {playlist.songs.map((song, index) => {
              const songName = typeof song === 'string' ? song : song.name;
              const songData = {
                name: songName,
                albumName: song.albumName || playlist.name,
                albumCover: song.albumCover || '/default-cover.jpg',
                audio: song.audio || `/music/${encodeURIComponent(songName)}.mp3`
              };

              return (
                <div 
                  key={index}
                  className="song-item"
                  onClick={() => handleSongClick(songData)}
                >
                  <span className="song-number">{index + 1}</span>
                  <span className="song-name">{songName}</span>
                  <span className="song-album">{songData.albumName}</span>
                  <button 
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSongFromPlaylist(playlist.id, songName);
                    }}
                  >
                    删除
                  </button>
                </div>
              );
            })}
          </div>
        </>
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