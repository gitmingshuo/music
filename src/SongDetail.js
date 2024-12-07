import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from './components/BackButton';
import './SongDetail.css';
import { useRecentPlays } from './context/RecentPlayContext';

function SongDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { song, audio: audioUrl, albumName, albumCover, songList, currentIndex } = location.state || {};
  const { addToRecentPlays } = useRecentPlays();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLyric, setCurrentLyric] = useState('');

  useEffect(() => {
    if (!audioUrl) {
      console.error('未找到音频URL');
      return;
    }

    console.log('加载音频:', audioUrl); // 调试信息
    const audio = new Audio(audioUrl);
    
    // 设置音频加载完成后的处理
    audio.oncanplaythrough = () => {
      console.log('音频加载完成，准备播放');
      audio.play()
        .then(() => {
          console.log('开始播放');
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('播放失败:', error);
        });
    };

    // 错误处理
    audio.onerror = (e) => {
      console.error('音频加载错误:', e);
    };

    setAudioElement(audio);

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  // 播放/暂停切换
  const togglePlay = useCallback(() => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play()
        .then(() => {
          console.log('播放成功');
        })
        .catch(err => {
          console.error('播放失败:', err);
        });
    }
    setIsPlaying(!isPlaying);
  }, [audioElement, isPlaying]);

  const playNext = useCallback(() => {
    if (currentIndex < songList?.length - 1) {
      const nextSong = songList[currentIndex + 1];
      navigate(`/song/${encodeURIComponent(nextSong)}`, {
        state: {
          song: nextSong,
          audio: `/music/${encodeURIComponent(nextSong)}.mp3`,
          albumName,
          albumCover,
          songList,
          currentIndex: currentIndex + 1
        }
      });
    }
  }, [navigate, currentIndex, songList, albumName, albumCover]);

  const playPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevSong = songList[currentIndex - 1];
      navigate(`/song/${encodeURIComponent(prevSong)}`, {
        state: {
          song: prevSong,
          audio: `/music/${encodeURIComponent(prevSong)}.mp3`,
          albumName,
          albumCover,
          songList,
          currentIndex: currentIndex - 1
        }
      });
    }
  }, [navigate, currentIndex, songList, albumName, albumCover]);

  useEffect(() => {
    console.log('组件状态:', {
      song,
      audioUrl,
      albumName,
      albumCover,
      currentIndex,
      location: location.state
    });
  }, [song, audioUrl, albumName, albumCover, currentIndex, location]);

  // 在歌曲加载时添加到最近播放
  useEffect(() => {
    if (song && albumCover && albumName) {
      addToRecentPlays({
        name: song,
        cover: albumCover,
        album: albumName
      });
    }
  }, [song, albumCover, albumName, addToRecentPlays]);

  if (!song) {
    return (
      <div className="error-message">
        <h2>未找到歌曲信息</h2>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="song-detail-container">
      <div className="song-background" style={{ backgroundImage: `url(${albumCover})` }} />
      <div className="song-content">
        <div className="album-info">
          <img 
            src={albumCover} 
            alt={albumName} 
            className={isPlaying ? 'rotating playing' : 'rotating'} 
          />
          <div className="song-info">
            <h1>{song}</h1>
            <p className="album-name">{albumName}</p>
            <p className="artist-name">周杰伦</p>
          </div>
        </div>

        <div className="lyrics-container">
          <p className="current-lyric">{currentLyric || '暂无歌词'}</p>
        </div>

        <div className="controls">
          <button onClick={playPrevious} disabled={currentIndex === 0}>上一首</button>
          <button onClick={togglePlay} className="play-button">
            {isPlaying ? '暂停' : '播放'}
          </button>
          <button onClick={playNext} disabled={currentIndex === songList?.length - 1}>下一首</button>
        </div>
      </div>
    </div>
  );
}

export default SongDetail;
