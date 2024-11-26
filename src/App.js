import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AlbumDetail from './AlbumDetail';
import Home from './Home';
import SongDetail from './SongDetail';import Search from './Search';

// 在路由配置中添加


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/album/:name" element={<AlbumDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/song/:name" element={<SongDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
