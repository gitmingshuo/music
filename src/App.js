//主页面
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoriteContext';
import { RecentPlayProvider } from './context/RecentPlayContext';
import Home from './Home';
import SideNav from './components/SideNav';
import PlaylistDetail from './components/PlaylistDetail';
import AlbumDetail from './AlbumDetail';
import SongDetail from './SongDetail';
import Search from './Search';
import Favorites from './components/Favorites';
import RecentPlays from './components/RecentPlays';
import Albums from './components/Albums';
import './App.css';

function App() {
  return (
    <RecentPlayProvider>
      <FavoritesProvider>
        <div className="app-container">
          <SideNav />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/albums" element={<Albums />} />
              <Route path="/playlist/:name" element={<PlaylistDetail />} />
              <Route path="/album/:name" element={<AlbumDetail />} />
              <Route path="/song/:id" element={<SongDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/recent-plays" element={<RecentPlays />} />
            </Routes>
          </div>
        </div>
      </FavoritesProvider>
    </RecentPlayProvider>
  );
}

export default App;
