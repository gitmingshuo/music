import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AlbumDetail.css';
import Comments from './components/Comments';

function AlbumDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { album } = location.state || {};

  if (!album) {
    return (
      <div className="error-page">
        <h2>没有找到专辑信息！</h2>
        <button className="back-button" onClick={() => navigate('/')}>
          返回主页
        </button>
      </div>
    );
  }

  const handleSongClick = async (song) => {
    try {
      const defaultLyrics = {
        title: song,
        artist: "周杰伦",
        lyrics: [
          { time: 0, text: "加载歌词中..." }
        ]
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
        },
      });
    } catch (error) {
      console.error('页面跳转失败:', error);
      alert('暂时无法播放该歌曲，请稍后再试');
    }
  };

  return (
    <div className="album-detail-page">
      {/* 返回主页按钮 */}
      <div className="album-detail-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <span>←</span> 返回
        </button>
      </div>

      {/* 专辑详细信息 */}
      <div className="album-detail-content">
        <div className="album-info-section">
          <img src={album.cover} alt={album.name} className="album-cover-large" />
          <div className="album-text-info">
            <h1>{album.name}</h1>
            <div className="album-meta">
              <span className="release-year">{album.year}</span>
              <span className="track-count">{album.songs.length} 首歌曲</span>
            </div>
            <p className="album-description">{album.description}</p>
          </div>
        </div>

        {/* 歌曲列表 */}
        <div className="tracklist-section">
          <h2>专辑歌曲</h2>
          <div className="tracklist">
            {album.songs.map((song, index) => (
              <div
                key={index}
                className="track-item"
                onClick={() => handleSongClick(song)}
              >
                <div className="track-number">{(index + 1).toString().padStart(2, '0')}</div>
                <div className="track-name">{song}</div>
              </div>
            ))}
          </div>
        </div>
        <Comments songName={album.name} />
      </div>
    </div>
  );
}

export default AlbumDetail;
