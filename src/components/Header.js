import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaSearch, FaEnvelope, FaBell } from 'react-icons/fa';
import UserSettings from './UserSettings';
import './Header.css';

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
      try {
        const response = await fetch('/api/messages/unread-count');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count);
        }
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
        <div 
          className="user-info" 
          onClick={() => {
            console.log('User info clicked');
            setShowUserMenu(!showUserMenu);
          }}
        >
          <img 
            src="/tubiao.png"
            alt="用户头像" 
            className="user-avatar"
          />
          <span className="user-name">{user?.username}</span>
        </div>
        {showUserMenu && (
          <div className="user-menu" ref={menuRef}>
            <button onClick={() => {
              setShowSettings(true);
              setShowUserMenu(false);
            }}>
              设置
            </button>
            <button onClick={logout}>退出登录</button>
          </div>
        )}
      </div>

      {showSettings && <UserSettings onClose={() => setShowSettings(false)} />}
    </header>
  );
}

export default Header; 