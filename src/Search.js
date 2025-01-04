import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import './Search.css';
import { albums } from './Home';

function Search() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [randomSongs, setRandomSongs] = useState([]);

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
    setRandomSongs(getRandomSongs(songs, 12));
  }, []);

  const getRandomSongs = (songs, count) => {
    const shuffled = [...songs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredSongs([]); 
      return;
    }

    const results = [];
    albums.forEach(album => {
      album.songs.forEach(song => {
        if (song.toLowerCase().includes(value.toLowerCase())) {
          results.push({
            name: song,
            album: album.name,
            cover: album.cover
          });
        }
      });
    });
    setFilteredSongs(results);
  };

  const handleSongClick = (song) => {
    navigate(`/song/${encodeURIComponent(song.name)}`, {
      state: { song: song.name }
    });
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索歌曲..."
            autoFocus
          />
        </div>
      </div>

      <div className="songs-container">
        <h2>{searchTerm ? '搜索结果' : '推荐歌曲'}</h2>
        <div className="songs-grid">
          {(searchTerm ? filteredSongs : randomSongs).map((song, index) => (
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
