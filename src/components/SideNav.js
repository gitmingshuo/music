import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaSearch, 
  FaMusic, 
  FaHeart, 
  FaHistory,
  FaList,
  FaPlus
} from 'react-icons/fa';
import './SideNav.css';
import { useMusic } from '../context/MusicContext';

function SideNav() {
  const { playlists, createPlaylist } = useMusic();
  
  const handleCreatePlaylist = () => {
    const name = prompt('请输入歌单名称');
    if (name && name.trim()) {
      createPlaylist(name.trim());
    }
  };
  
  return (
    <nav className="side-nav">
      <div className="logo">
        <h1>心拓音乐</h1>
      </div>

      <div className="nav-section">
        <h3>推荐</h3>
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaHome />
              <span>发现音乐</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaSearch />
              <span>搜索</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="nav-section">
        <h3>我的音乐</h3>
        <ul>
          <li>
            <NavLink to="/albums" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaMusic />
              <span>专辑</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/favorites" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaHeart />
              <span>我喜欢</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/recent-plays" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaHistory />
              <span>最近播放</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="nav-section">
        <div className="section-header">
          <h3>创建的歌单</h3>
          <button 
            className="create-playlist-btn"
            onClick={handleCreatePlaylist}
            title="创建新歌单"
          >
            <FaPlus />
          </button>
        </div>
        <ul>
          {playlists.map(playlist => (
            <li key={playlist.id}>
              <NavLink 
                to={`/playlist/${playlist.id}`} 
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <FaList />
                <span>{playlist.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default SideNav;