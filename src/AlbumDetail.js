//
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import BackButton from './components/BackButton';
import './AlbumDetail.css';

function AlbumDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const album = location.state?.album; // 直接从 location.state 获取专辑信息
  
  console.log('专辑信息:', album); // 调试用

  const handleSongClick = async (song) => {
    try {
      const defaultLyrics = {
        title: song,
        artist: "周杰伦",
        lyrics: [{ time: 0, text: "加载歌词中..." }]
      };

      let lyrics = defaultLyrics;
      
      try {
        const response = await fetch(`/lyrics/${encodeURIComponent(song)}.json`);
        if (response.ok) {
          lyrics = await response.json();
        }
      } catch (error) {
        console.warn('歌词加载失败，使用默认歌词');
      }

      navigate(`/song/${encodeURIComponent(song)}`, {
        state: {
          song: song,
          lyrics: lyrics.lyrics,
          audio: album.name === "最伟大的作品" ? `/music/${encodeURIComponent(song)}.mp3` : "/music/最伟大的作品.mp3",
          albumName: album.name,
          albumCover: album.cover,
          songList: album.songs,
          currentIndex: album.songs.indexOf(song)
        }
      });
    } catch (error) {
      console.error('页面跳转失败:', error);
      alert('暂时无法播放该歌曲，请稍后再试');
    }
  };

  if (!album) {
    return (
      <div className="error-page">
        <h2>未找到专辑信息</h2>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="album-detail-page">
      <BackButton />
      <div className="album-info">
        <img src={album.cover} alt={album.name} className="album-cover" />
        <div className="album-details">
          <h1>{album.name}</h1>
          <p className="album-year">{album.year}</p>
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
