import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecentPlays } from '../context/RecentPlayContext';
import { albums } from '../Home';
import './RecentPlays.css';

function RecentPlays() {
  const navigate = useNavigate();
  const { recentPlays } = useRecentPlays();

  const handleSongClick = async (song) => {
    const albumInfo = albums.find(album => album.name === song.album);
    
    try {
      const defaultLyrics = {
        title: song.name,
        artist: "周杰伦",
        lyrics: [{ time: 0, text: "加载歌词中..." }]
      };

      let lyrics = defaultLyrics;
      
      try {
        const response = await fetch(`/lyrics/${encodeURIComponent(song.name)}.json`);
        if (response.ok) {
          lyrics = await response.json();
        }
      } catch (error) {
        console.warn('歌词加载失败，使用默认歌词');
      }

      navigate(`/song/${encodeURIComponent(song.name)}`, {
        state: {
          song: song.name,
          lyrics: lyrics.lyrics,
          audio: albumInfo.name === "最伟大的作品" ? `/music/${encodeURIComponent(song.name)}.mp3` : "/music/最伟大的作品.mp3",
          albumName: song.album,
          albumCover: song.cover,
          songList: albumInfo.songs,
          currentIndex: albumInfo.songs.indexOf(song.name)
        }
      });
    } catch (error) {
      console.error('页面跳转失败:', error);
      alert('暂时无法播放该歌曲，请稍后再试');
    }
  };

  return (
    <div className="recent-plays-page">
      <div className="recent-plays-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span>←</span> 返回
        </button>
        <h1>最近播放</h1>
      </div>

      <div className="recent-plays-list">
        {recentPlays.map((song, index) => (
          <div 
            key={index} 
            className="recent-play-item"
            onClick={() => handleSongClick(song)}
          >
            <img src={song.cover} alt={song.name} className="song-cover" />
            <div className="song-info">
              <span className="song-name">{song.name}</span>
              <span className="album-name">{song.album}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentPlays;