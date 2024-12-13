import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { FaHome, FaSearch, FaCompactDisc, FaHeart, FaClock, FaSignOutAlt } from 'react-icons/fa';
import './SideNav.css';

function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 创建默认歌单
  const playlists = [
    {
      name: '最伟大的作品',
      cover: require('../image/最伟大的作品.jpg'),
      songs: ['最伟大的作品', '红颜如霜', '不爱我就拉倒', '等你下课', '我是如此相信', '说好不哭', 'mojito', '倒影', '粉色海洋', '错过的烟火', 'Intro', '还在流浪']
    }
  ];

  return (
    <div className="jay-sidenav">
      <div className="jay-sidenav__header">
        <h1>周杰伦音乐</h1>
      </div>
      
      <div className="jay-sidenav__section">
        <div className="jay-sidenav__group">
          <Link to="/" className={`jay-sidenav__item ${location.pathname === '/' ? 'active' : ''}`}>
            <FaHome className="jay-sidenav__icon" />
            <span>推荐</span>
          </Link>
          
          <Link to="/search" className={`jay-sidenav__item ${location.pathname === '/search' ? 'active' : ''}`}>
            <FaSearch className="jay-sidenav__icon" />
            <span>搜索</span>
          </Link>
          
          <Link to="/albums" className={`jay-sidenav__item ${location.pathname === '/albums' ? 'active' : ''}`}>
            <FaCompactDisc className="jay-sidenav__icon" />
            <span>专辑</span>
          </Link>
        </div>
      </div>

      <div className="jay-sidenav__section">
        <div className="jay-sidenav__title">我的音乐</div>
        <div className="jay-sidenav__group">
          <Link to="/favorites" className={`jay-sidenav__item ${location.pathname === '/favorites' ? 'active' : ''}`}>
            <FaHeart className="jay-sidenav__icon" />
            <span>我喜欢的音乐</span>
          </Link>
          
          <Link to="/recent-plays" className={`jay-sidenav__item ${location.pathname === '/recent-plays' ? 'active' : ''}`}>
            <FaClock className="jay-sidenav__icon" />
            <span>最近播放</span>
          </Link>
        </div>
      </div>

      <div className="jay-sidenav__section">
        <div className="jay-sidenav__title">创建的歌单</div>
        <div className="jay-sidenav__playlists">
          {playlists.map((playlist, index) => (
            <div 
              key={index} 
              className="jay-sidenav__playlist-item"
              onClick={() => navigate(`/playlist/${playlist.name}`, { state: { playlist } })}
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
    </div>
  );
}

export default SideNav;