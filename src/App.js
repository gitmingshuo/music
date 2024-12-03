import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FavoriteProvider } from './context/FavoriteContext';
import { RecentPlayProvider } from './context/RecentPlayContext';
import Home from './Home';
import SongDetail from './SongDetail';
import AlbumDetail from './AlbumDetail';
import Search from './Search';
import Favorites from './components/Favorites';
import RecentPlays from './components/RecentPlays';
import Albums from './components/Albums';
import './App.css';

function App() {
  return (
    <FavoriteProvider>
      <RecentPlayProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/song/:id" element={<SongDetail />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/album/:id" element={<AlbumDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/recent" element={<RecentPlays />} />
          </Routes>
        </Router>
      </RecentPlayProvider>
    </FavoriteProvider>
  );
}

export default App;
