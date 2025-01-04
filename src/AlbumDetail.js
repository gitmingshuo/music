import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMusic } from './context/MusicContext';
import './AlbumDetail.css';
import { motion } from 'framer-motion';
import AddToPlaylistButton from './components/AddToPlaylistButton';

function AlbumDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToPlaylist } = useMusic();
  const album = location.state?.album;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!album) {
      setError('专辑不存在');
      return;
    }
    
    // 简化加载逻辑
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [album]);

  const handleSongClick = async (song) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fileName = encodeURIComponent(song);
      const audioPath = `/static/music/${fileName}.mp3`;
      
      // 简化文件检查逻辑
      const response = await fetch(audioPath, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`音频文件不存在: ${song}`);
      }

      const songInfo = {
        name: song,
        albumName: album.name,
        albumCover: album.cover,
        audio: audioPath
      };
      
      const playlist = album.songs.map(s => ({
        name: s,
        albumName: album.name,
        albumCover: album.cover,
        audio: `/static/music/${encodeURIComponent(s)}.mp3`
      }));

      await addToPlaylist(songInfo, playlist);
      navigate(`/song/${fileName}`);
    } catch (err) {
      console.error('播放失败:', err);
      setError(err.message || '播放失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!album) return null;

  return (
    <motion.div 
      className="album-detail-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isLoading ? (
        <div className="loading-spinner">加载中...</div>
      ) : (
        <>
          <img 
            src={album.cover} 
            alt={album.name}
            className="album-background"
          />
          
          <div className="album-content">
            <div className="album-header">
              <img 
                src={album.cover} 
                alt={album.name} 
                className="album-cover"
              />
              
              <div className="album-info">
                <h1>{album.name}</h1>
                <div className="album-meta">
                  <span>发行年份: {album.year}</span>
                  <span>•</span>
                  <span>{album.songs.length} 首歌</span>
                </div>
                <p className="album-description">{album.description}</p>
              </div>
            </div>

            <div className="songs-section">
              <div className="songs-header">
                <div>#</div>
                <div>歌曲名</div>
                <div></div>
              </div>
              
              <motion.div 
                className="song-list"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {album.songs.map((song, index) => (
                  <div 
                    key={index}
                    className="song-item"
                    onClick={() => handleSongClick(song)}
                  >
                    <span className="song-number">{index + 1}</span>
                    <span className="song-name">{song}</span>
                    <AddToPlaylistButton 
                      song={{
                        name: song,
                        albumName: album.name,
                        albumCover: album.cover,
                        audio: `/static/music/${song}.mp3`
                      }}
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default AlbumDetail;
