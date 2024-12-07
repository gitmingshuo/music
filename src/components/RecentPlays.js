//最近播放
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecentPlays } from '../context/RecentPlayContext';
import BackButton from './BackButton';
import './RecentPlays.css';

function RecentPlays() {
  const navigate = useNavigate();
  const { recentPlays } = useRecentPlays();

  const handleSongClick = async (song) => {
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
          audio: '/music/最伟大的作品.mp3',
          albumName: song.album,
          albumCover: song.cover,
          songList: [],
          currentIndex: 0,
          autoPlay: true
        }
      });
    } catch (error) {
      console.error('页面跳转失败:', error);
      alert('暂时无法播放该歌曲，请稍后再试');
    }
  };

  return (
    <div className="recent-plays-container">
      <BackButton />
      <h2>最近播放</h2>
      <div className="recent-plays-list">
        {recentPlays.length > 0 ? (
          recentPlays.map((song, index) => (
            <div 
              key={index}
              className="recent-play-item"
              onClick={() => handleSongClick(song)}
            >
              <img src={song.cover} alt={song.name} className="recent-play-cover" />
              <div className="recent-play-info">
                <div className="recent-play-name">{song.name}</div>
                <div className="recent-play-album">{song.album}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-message">暂无播放记录</div>
        )}
      </div>
    </div>
  );
}

export default RecentPlays;

