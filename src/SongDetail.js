import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './SongDetail.css';
import { usePlayer } from './context/PlayerContext';

function SongDetail() {
  const { setCurrentSong } = usePlayer();
  const location = useLocation();
  const { song, albumName, albumCover, audio: audioUrl } = location.state || {};

  useEffect(() => {
    // 更新全局播放状态
    setCurrentSong({
      name: song,
      album: albumName,
      cover: albumCover,
      audio: audioUrl
    });
  }, [song, albumName, albumCover, audioUrl, setCurrentSong]);

  return (
    <div className="song-detail-container">
      <div className="song-header">
        <div className="song-title">
          <h1>{song}</h1>
          <div className="song-meta">
            <span>专辑：{albumName}</span>
            <span>歌手：周杰伦</span>
            <span>来源：心拓-喜欢的音乐</span>
          </div>
        </div>
        <div className="song-tabs">
          <span className="active">歌词</span>
          <span>百科</span>
          <span>相似推荐</span>
        </div>
      </div>

      <div className="song-content">
        <div className="vinyl-container">
          <div className="vinyl-arm"></div>
          <div className="vinyl-disc">
            <img src={albumCover} alt={song} className="vinyl-cover" />
          </div>
        </div>

        <div className="lyrics-container">
          <div className="lyrics-scroll">
            <p>暂无歌词</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SongDetail;
