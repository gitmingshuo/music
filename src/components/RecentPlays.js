import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecentPlays } from '../context/RecentPlaysContext';
import { usePlayer } from '../context/PlayerContext';
import BackButton from './BackButton';
import './RecentPlays.css';

function RecentPlays() {
  const navigate = useNavigate();
  const { recentPlays, clearRecentPlays } = useRecentPlays();
  const { setCurrentSong, setIsPlaying } = usePlayer();

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

      // 设置当前播放歌曲
      setCurrentSong({
        name: song.name,
        audio: `/music/最伟大的作品.mp3`,
        albumName: song.album,
        albumCover: song.cover,
        lyrics: lyrics.lyrics
      });
      setIsPlaying(true);

      // 导航到歌曲详情页
      navigate(`/song/${encodeURIComponent(song.name)}`, {
        state: {
          song: song.name,
          lyrics: lyrics.lyrics,
          audio: `/music/最伟大的作品.mp3`,
          albumName: song.album,
          albumCover: song.cover,
          autoPlay: true
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
        <BackButton />
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
              <img src={song.cover} alt={song.name} className="song-cover" />
              <div className="song-info">
                <span className="song-name">{song.name}</span>
                <span className="album-name">{song.album}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecentPlays;
