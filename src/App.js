import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AlbumDetail from './AlbumDetail';
import Home from './Home';
import SongDetail from './SongDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/album/:name" element={<AlbumDetail />} />
        <Route path="/song/:name" element={<SongDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
