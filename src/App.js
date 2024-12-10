import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
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

import './App.css';

function App() {
  return (
    <UserProvider>
      <RecentPlaysProvider>
        <PlayerProvider>
          <FavoriteProvider>
            <div className="app">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/*"
                  element={
                    <PrivateRoute>
                      <div className="main-layout">
                        <SideNav />
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
                          </Routes>
                        </div>
                        <Player />
                      </div>
                    </PrivateRoute>
                  }
                />
              </Routes>
            </div>
          </FavoriteProvider>
        </PlayerProvider>
      </RecentPlaysProvider>
    </UserProvider>
  );
}

export default App;


