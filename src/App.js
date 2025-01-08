import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { MusicProvider } from './context/MusicContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MessageProvider } from './context/MessageContext';
import { API_BASE_URL } from './config/api';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import { ThemeProvider } from './context/ThemeContext';
import { initPushNotifications } from './utils/pushNotifications';

// 组件导入111
import Home from './Home';
import SideNav from './components/SideNav';
import AlbumDetail from './AlbumDetail';
import SongDetail from './SongDetail';
import Search from './Search';
import Favorites from './components/Favorites';
import Player from './components/Player';
import Albums from './components/Albums';
import RecentPlays from './components/RecentPlays';
import Header from './components/Header';
import Playlist from './components/Playlist';
import Messages from './pages/Messages';

import './styles/themes.css';
import './App.css';

// 错误边界组件
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('错误详情:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>出错了</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>刷新页面</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 创建一个新的组件来使用 useAuth
function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      try {
        initPushNotifications(user.id).catch(error => {
          console.warn('Push notifications not available:', error);
        });
      } catch (error) {
        console.warn('Push notifications setup failed:', error);
      }
    }
  }, [user]);

  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/*" element={
        <PrivateRoute>
          <div className="app">
            <SideNav />
            <div className="main-container">
              <Header />
              <div className="content-wrapper">
                <div className="main-content">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/album/:id" element={<AlbumDetail />} />
                    <Route path="/song/:id" element={<SongDetail />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/albums" element={<Albums />} />
                    <Route path="/recent-plays" element={<RecentPlays />} />
                    <Route path="/playlist/:id" element={<Playlist />} />
                    <Route path="/messages" element={<Messages />} />
                  </Routes>
                </div>
              </div>
            </div>
            <Player />
          </div>
        </PrivateRoute>
      } />
    </Routes>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log('App mounted, environment:', process.env.NODE_ENV);
      console.log('API URL:', API_BASE_URL);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>出错了: {error}</div>;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <MusicProvider>
            <MessageProvider>
              <AppContent />
            </MessageProvider>
          </MusicProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// 公共路由组件
function PublicRoute({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return children;
}

export default App;


