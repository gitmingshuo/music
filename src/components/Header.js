import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaSearch } from 'react-icons/fa';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

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
        <div className="user-info">
          <img 
            src="/Users/admin/my-website/public/static/media/叶惠美.jpg" 
            alt="用户头像" 
            className="user-avatar"
          />
          <span className="user-name">将</span>
        </div>
      </div>
    </header>
  );
}

export default Header; 