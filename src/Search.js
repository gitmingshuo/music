import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './components/BackButton';
import './Search.css';
import { albums } from './Home';

function Search() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [randomSongs, setRandomSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);

  // 从 Home.js 中获取所有歌曲
  useEffect(() => {
    const songs = [];
    albums.forEach(album => {
      album.songs.forEach(song => {
        songs.push({
          name: song,
          album: album.name,
          cover: album.cover
        });
      });
    });
    setAllSongs(songs);
    
    // 随机选择10首歌
    const shuffled = [...songs].sort(() => 0.5 - Math.random());
    setRandomSongs(shuffled.slice(0, 8));
  }, []);

  const handleSongClick = async (song) => {
    const albumInfo = albums.find(album => album.name === song.album);
    
    console.log('点击歌曲:', song);
    console.log('专辑信息:', albumInfo);
    
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

      console.log('导航状态:', {
        song: song.name,
        albumName: song.album,
        previousPath: '/search'
      });

      navigate(`/song/${encodeURIComponent(song.name)}`, {
        state: {
          song: song.name,
          lyrics: lyrics.lyrics,
          audio: albumInfo.name === "最伟大的作品" ? `/music/${encodeURIComponent(song.name)}.mp3` : "/music/最伟大的作品.mp3",
          albumName: song.album,
          albumCover: song.cover,
          songList: albumInfo.songs,
          currentIndex: albumInfo.songs.indexOf(song.name),
          previousPath: '/search'
        },
        replace: false
      });
    } catch (error) {
      console.error('页面跳转失败:', error);
      alert('暂时无法播放该歌曲，请稍后再试');
    }
  };

  const filteredSongs = searchTerm
    ? allSongs.filter(song => 
        song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.album.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : randomSongs;

  return (
    <div className="search-page">
      <div className="search-header">
        <BackButton />
        <div className="search-bar">
          <input
            type="text"
            placeholder="搜索歌曲..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="songs-container">
        <h2>{searchTerm ? '搜索结果' : '推荐歌曲'}</h2>
        <div className="songs-grid">
          {filteredSongs.map((song, index) => (
            <div
              key={index}
              className="song-card"
              onClick={() => handleSongClick(song)}
            >
              <img src={song.cover} alt={song.name} />
              <div className="song-info">
                <h3>{song.name}</h3>
                <p>{song.album}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Search;
