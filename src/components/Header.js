import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaSearch, FaEnvelope } from 'react-icons/fa';
import UserSettings from './UserSettings';
import './Header.css';
import { API_ENDPOINTS, apiRequest } from '../config/api';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      
      try {
        const data = await apiRequest(
          `${API_ENDPOINTS.UNREAD_COUNT}?userId=${user.id}`
        );
        setUnreadCount(data.count);
      } catch (error) {
        console.error('获取未读消息数量失败:', error);
      }
    };

    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <div className="nav-buttons">
          <button 
            className="nav-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>
          <button 
            className="nav-btn"
            onClick={() => navigate(1)}
          >
            <FaArrowRight />
          </button>
        </div>
        
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="搜索音乐" 
            onClick={() => navigate('/search')}
          />
        </div>
      </div>
      
      <div className="header-right">
        <div className="message-icon" onClick={() => navigate('/messages')}>
          <FaEnvelope />
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </div>
        <div className="user-container">
          <img 
            src="/tubiao.png"
            alt="网站图标" 
            className="site-logo"
          />
          <div 
            className="user-info" 
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user?.avatar}
            </div>
            <span className="username">{user?.username}</span>
          </div>
          {showUserMenu && (
            <div className="user-menu" ref={menuRef}>
              <button onClick={() => {
                setShowSettings(true);
                setShowUserMenu(false);
              }}>
                设置
              </button>
              <button onClick={logout}>退出</button>
            </div>
          )}
        </div>
      </div>

      {showSettings && <UserSettings onClose={() => setShowSettings(false)} />}
    </header>
  );
}

export default Header; 