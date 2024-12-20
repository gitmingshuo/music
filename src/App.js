import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { FavoriteProvider } from './context/FavoriteContext';
import { RecentPlaysProvider } from './context/RecentPlaysContext';
import { PlayerProvider } from './context/PlayerContext';

// 组件导入
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import Home from './Home';
import SideNav from './components/SideNav';
import PlaylistDetail from './components/PlaylistDetail';
import AlbumDetail from './AlbumDetail';
import SongDetail from './SongDetail';
import Search from './Search';
import Favorites from './components/Favorites';
import Player from './components/Player';
import Albums from './components/Albums';
import RecentPlays from './components/RecentPlays';
import Header from './components/Header';
import Profile from './components/Profile';
import Level from './components/Level';
import Settings from './components/Settings';
import Register from './components/Register';

import './App.css';

function App() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 检查是否在登录或注册页面
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    
    // 只有当用户状态明确时才进行重定向
    if (currentUser === null && !isAuthPage) {
      // 用户未登录且不在登录页面
      navigate('/login', { replace: true });
    } else if (currentUser && isAuthPage) {
      // 用户已登录但在登录页面
      navigate('/', { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  // 如果用户状态正在加载，显示加载状态
  if (currentUser === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <UserProvider>
      <PlayerProvider>
        <FavoriteProvider>
          <RecentPlaysProvider>
            <div className="app">
              {currentUser && location.pathname !== '/login' && location.pathname !== '/register' && (
                <Header />
              )}
              <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/*"
                  element={
                    <PrivateRoute>
                      <div className="main-layout">
                        <SideNav />
                        <div className="content-wrapper">
                          <div className="main-content">
                            <Routes>
                              <Route path="/" element={<Home />} />
                              <Route path="/playlist/:id" element={<PlaylistDetail />} />
                              <Route path="/album/:id" element={<AlbumDetail />} />
                              <Route path="/song/:id" element={<SongDetail />} />
                              <Route path="/search" element={<Search />} />
                              <Route path="/favorites" element={<Favorites />} />
                              <Route path="/albums" element={<Albums />} />
                              <Route path="/recent-plays" element={<RecentPlays />} />
                              <Route path="/profile" element={<Profile />} />
                              <Route path="/level" element={<Level />} />
                              <Route path="/settings" element={<Settings />} />
                            </Routes>
                          </div>
                        </div>
                      </div>
                    </PrivateRoute>
                  }
                />
              </Routes>
              {currentUser && location.pathname !== '/login' && location.pathname !== '/register' && (
                <Player />
              )}
            </div>
          </RecentPlaysProvider>
        </FavoriteProvider>
      </PlayerProvider>
    </UserProvider>
  );
}

export default App;


