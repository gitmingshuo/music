import React from 'react';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import { FavoriteProvider } from './context/FavoriteContext';
import { RecentPlayProvider } from './context/RecentPlayContext';
import { PlayerProvider } from './context/PlayerContext';

// 组件导入
import Home from './Home';
import SideNav from './components/SideNav';
import PlaylistDetail from './components/PlaylistDetail';
import AlbumDetail from './AlbumDetail';
import SongDetail from './SongDetail';
import Search from './Search';
import Favorites from './components/Favorites';
import RecentPlays from './components/RecentPlays';
import Player from './components/Player';
import Albums from './components/Albums';

import './App.css';

function App() {
  return (
    <FavoriteProvider>
      <RecentPlayProvider>
        <PlayerProvider>
          <div className="app">
            <SideNav />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/playlist/:id" element={<PlaylistDetail />} />
                <Route path="/album/:id" element={<AlbumDetail />} />
                <Route path="/song/:id" element={<SongDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/recent" element={<RecentPlays />} />
                <Route path="/albums" element={<Albums />} />
              </Routes>
            </main>
            <Player />
          </div>
        </PlayerProvider>
      </RecentPlayProvider>
    </FavoriteProvider>
  );
}

export default App;


