import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaCompactDisc, FaHeart, FaChevronRight, FaClock } from 'react-icons/fa';
import './SideNav.css';

const playlists = [
  {
    name: '最伟大的作品',
    cover: require('../image/最伟大的作品.jpg'),
    songs: ['最伟大的作品', '红颜如霜', '不爱我就拉倒', '等你下课', '我是如此相信', 
            '说好不哭', 'mojito', '倒影', '粉色海洋', '错过的烟火','Intro', '还在流浪']
  }
];

function SideNav() {
  const navigate = useNavigate();
  
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handlePlaylistClick = (playlist) => {
    navigate(`/playlist/${playlist.name}`, { 
      state: { 
        name: playlist.name,
        cover: playlist.cover,
        songs: playlist.songs 
      } 
    });
  };

  return (
    <nav className="jay-sidenav">
      <div className="jay-sidenav__logo">
        <h1 className="jay-sidenav__logo-title">周杰伦音乐</h1>
      </div>
      
      <div className="jay-sidenav__section">
        <div className="jay-sidenav__nav-group">
          <div className="jay-sidenav__nav-item" onClick={() => handleNavigation('/')}>
            <FaHome className="jay-sidenav__nav-icon" />
            <span className="jay-sidenav__nav-text">推荐</span>
          </div>
          <div className="jay-sidenav__nav-item" onClick={() => handleNavigation('/search')}>
            <FaSearch className="jay-sidenav__nav-icon" />
            <span className="jay-sidenav__nav-text">搜索</span>
          </div>
          <div className="jay-sidenav__nav-item" onClick={() => handleNavigation('/albums')}>
            <FaCompactDisc className="jay-sidenav__nav-icon" />
            <span className="jay-sidenav__nav-text">专辑</span>
          </div>
        </div>
      </div>

      <div className="jay-sidenav__section">
        <h3 className="jay-sidenav__section-title">我的</h3>
        <div className="jay-sidenav__nav-group">
          <div className="jay-sidenav__nav-item" onClick={() => navigate('/favorites')}>
            <FaHeart className="jay-sidenav__nav-icon" />
            <span className="jay-sidenav__nav-text">我喜欢的音乐</span>
            <FaChevronRight className="jay-sidenav__nav-arrow" />
          </div>
          <div className="jay-sidenav__nav-item" onClick={() => navigate('/recent-plays')}>
            <FaClock className="jay-sidenav__nav-icon" />
            <span className="jay-sidenav__nav-text">最近播放</span>
          </div>
        </div>
      </div>

      <div className="jay-sidenav__section">
        <h3 className="jay-sidenav__section-title">创建的歌单</h3>
        <div className="jay-sidenav__playlist-group">
          {playlists.map((playlist, index) => (
            <div 
              key={index} 
              className="jay-sidenav__playlist-item"
              onClick={() => handlePlaylistClick(playlist)}
            >
              <img 
                src={playlist.cover} 
                alt={playlist.name} 
                className="jay-sidenav__playlist-cover"
              />
              <span className="jay-sidenav__playlist-name">{playlist.name}</span>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default SideNav;