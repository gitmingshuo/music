import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Header.css';

function Header() {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="header">
      <div className="header-left">
        <div className="header-search">
          <input type="text" placeholder="搜索音乐、歌手、歌词、用户" />
        </div>
      </div>
      
      <div className="header-right">
        <div className="user-info" onClick={() => setShowMenu(!showMenu)}>
          <div className="avatar">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="头像" />
            ) : (
              <span>{currentUser?.username?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <span className="username">{currentUser?.username}</span>
          
          {showMenu && (
            <div className="user-menu">
              <div className="menu-items">
                <div className="menu-item" onClick={() => navigate('/profile')}>
                  个人主页
                </div>
                <div className="menu-item" onClick={() => navigate('/level')}>
                  我的等级
                </div>
                <div className="menu-item" onClick={() => navigate('/settings')}>
                  个人设置
                </div>
                <div className="menu-item" onClick={handleLogout}>
                  退出登录
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header; 