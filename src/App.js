import React from 'react';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import { FavoriteProvider } from './context/FavoriteContext';
import { RecentPlaysProvider } from './context/RecentPlaysContext';
import { PlayerProvider } from './context/PlayerContext';


// 组件导入
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
    <RecentPlaysProvider>
      <PlayerProvider>
        <FavoriteProvider>
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
                <Route path="/albums" element={<Albums />} />
                <Route path="/recent-plays" element={<RecentPlays />} />
              </Routes>
            </main>
            <Player />
          </div>
        </FavoriteProvider>
      </PlayerProvider>
    </RecentPlaysProvider>
  );
}

export default App;


