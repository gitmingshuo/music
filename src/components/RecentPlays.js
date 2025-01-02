import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import './RecentPlays.css';

function RecentPlays() {
  const navigate = useNavigate();
  const { 
    recentPlays, 
    clearRecentPlays, 
    setCurrentSong, 
    setIsPlaying,
    getAlbumInfo,
    getAudioPath
  } = useMusic();

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

      setCurrentSong(songWithInfo);
      setIsPlaying(true);

      navigate(`/song/${encodeURIComponent(song.name)}`, {
        state: {
          song: songWithInfo
        }
      });
    } catch (error) {
      console.error('播放失败:', error);
      alert('暂时无法播放该歌曲，请稍后再试');
    }
  };

  return (
    <div className="recent-plays-page">
      <div className="recent-plays-header">
        <h1>最近播放</h1>
        {recentPlays.length > 0 && (
          <button 
            onClick={clearRecentPlays} 
            className="clear-history-btn"
          >
            清空播放记录
          </button>
        )}
      </div>
      <div className="recent-plays-list">
        {recentPlays.length === 0 ? (
          <p>暂无播放记录</p>
        ) : (
          recentPlays.map((song, index) => (
            <div 
              key={index} 
              className="recent-play-item"
              onClick={() => handleSongClick(song)}
            >
              <img 
                src={song.cover || getAlbumInfo(song.name).albumCover} 
                alt={song.name} 
                className="song-cover"
                onError={(e) => {
                  e.target.src = '/static/media/default-cover.jpg';
                }}
              />
              <div className="song-info">
                <span className="song-name">{song.name}</span>
                <span className="album-name">{song.albumName || getAlbumInfo(song.name).albumName}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecentPlays;
