import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SongDetail.css';

function SongDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { song, lyrics, audio, albumCover, albumName, songList, currentIndex } = location.state || {};
  const [currentTime, setCurrentTime] = useState(0); // 当前播放时间
  const audioRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  // 格式化时间
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 处理进度条点击
  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX;
    const progressWidth = progressBar.offsetWidth;
    const newTime = (clickPosition / progressWidth) * duration;
    audioRef.current.currentTime = newTime;
  };

  // 高亮当前歌词
  const scrollToCurrentLyric = () => {
    const activeLyric = document.querySelector('.lyric.active');
    if (activeLyric) {
      activeLyric.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    scrollToCurrentLyric();
  }, [currentTime]);

  // 监听时间更新
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      
      // 更新当前歌词
      const index = lyrics?.findIndex((lyric, i) => {
        const nextLyric = lyrics[i + 1];
        return time >= lyric.time && (!nextLyric || time < nextLyric.time);
      });
      
      if (index !== -1) {
        setCurrentLyricIndex(index);
      }
    }
  };

  // 播放控制
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // 添加切换歌曲函数
  const switchSong = async (direction) => {
    if (!songList) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : songList.length - 1;
    } else {
      newIndex = currentIndex < songList.length - 1 ? currentIndex + 1 : 0;
    }
    
    const newSong = songList[newIndex];
    
    try {
      let lyrics = {
        title: newSong,
        artist: "周杰伦",
        lyrics: [{ time: 0, text: "加载歌词中..." }]
      };
      
      try {
        const response = await fetch(`/lyrics/${encodeURIComponent(newSong)}.json`);
        if (response.ok) {
          lyrics = await response.json();
        }
      } catch (error) {
        console.warn('歌词加载失败，使用默认歌词');
      }
      
      navigate(`/song/${encodeURIComponent(newSong)}`, {
        state: {
          song: newSong,
          lyrics: lyrics.lyrics,
          audio: `/music/${encodeURIComponent(newSong)}.mp3`,
          albumName: albumName,
          albumCover: albumCover,
          songList: songList,
          currentIndex: newIndex
        },
        replace: true // 替换当前历史记录
      });
    } catch (error) {
      console.error('切换歌曲失败:', error);
      alert('暂时无法切换歌曲，请稍后再试');
    }
  };

  // 添加自动播放效果
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.warn('自动播放失败:', error);
          setIsPlaying(false);
        });
    }
  }, [song]); // 当歌曲改变时触发

  // 提前渲染页面，即使数据为空也不会中断
  if (!song) {
    return (
      <div className="error-page">
        <h2>没有找到歌曲信息！</h2>
        <button onClick={() => navigate(-1)}>返回</button>
      </div>
    );
  }

  return (
    <div className="song-detail-page">
      <div className="background-blur" style={{ backgroundImage: `url(${albumCover})` }}></div>
      <div className="content-wrapper">
        <button onClick={() => navigate(-1)} className="back-button">返回</button>
        
        <div className="player-container">
          <div className="album-cover">
            <img src={albumCover} alt={song} className={`cover-img ${isPlaying ? 'rotating' : ''}`} />
          </div>

          <div className="right-section">
            <div className="song-info">
              <h1>{song}</h1>
              <p className="album-name">{albumName}</p>
            </div>

            <div className="lyrics-section">
              <div className="lyrics-container" ref={lyricsContainerRef}>
                {lyrics?.map((line, index) => (
                  <p
                    key={index}
                    className={`lyric ${index === currentLyricIndex ? 'active' : ''}`}
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="player-controls">
          <div className="progress-bar" onClick={handleProgressClick}>
            <div className="progress" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
          </div>
          
          <div className="time-info">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="controls">
            <button className="control-btn" onClick={() => switchSong('prev')}>上一首</button>
            <button className={`play-btn ${isPlaying ? 'playing' : ''}`} onClick={togglePlay}>
              {isPlaying ? '暂停' : '播放'}
            </button>
            <button className="control-btn" onClick={() => switchSong('next')}>下一首</button>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audio}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        preload="metadata"
      />
    </div>
  );
}

export default SongDetail;
