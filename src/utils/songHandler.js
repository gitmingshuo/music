import { usePlayer } from '../context/PlayerContext';

//处理歌曲点击播放的逻辑
import { albums } from '../Home';

export const handleSongClick = (song, navigate) => {
  // 确保歌曲对象包含必要信息
  const processedSong = {
    ...song,
    url: song.url || '/music/我是如此相信.mp3', // 使用默认音频
    cover: song.cover || song.albumCover || '/default-cover.jpg', // 使用封面或默认封面
  };

  // 触发播放
  if (window.audioPlayer) {
    window.audioPlayer.playSong(processedSong);
  }

  // 更新播放历史
  const recentPlays = JSON.parse(localStorage.getItem('recentPlays') || '[]');
  const updatedPlays = [processedSong, ...recentPlays.filter(p => p.name !== song.name)].slice(0, 50);
  localStorage.setItem('recentPlays', JSON.stringify(updatedPlays));

  // 如果需要，导航到歌曲详情页
  if (navigate) {
    navigate(`/song/${encodeURIComponent(song.name)}`);
  }
};

export const loadLyrics = async (songName) => {
  let lyrics = {
    title: songName,
    artist: "周杰伦",
    lyrics: [{ time: 0, text: "加载歌词中..." }]
  };

  try {
    const response = await fetch(`/lyrics/${encodeURIComponent(songName)}.json`);
    if (response.ok) {
      lyrics = await response.json();
    }
  } catch (error) {
    console.warn('歌词加载失败，使用默认歌词');
  }

  return lyrics;
};

export const switchSong = async (direction, currentIndex, songList, navigate, albumName, albumCover) => {
  if (!songList) return;

  let newIndex;
  if (direction === 'prev') {
    newIndex = currentIndex > 0 ? currentIndex - 1 : songList.length - 1;
  } else {
    newIndex = currentIndex < songList.length - 1 ? currentIndex + 1 : 0;
  }

  const newSong = songList[newIndex];
  const lyrics = await loadLyrics(newSong);

  navigate(`/song/${encodeURIComponent(newSong)}`, {
    state: {
      song: newSong,
      lyrics: lyrics.lyrics,
      audio: `/music/${encodeURIComponent(newSong)}.mp3`,
      albumName,
      albumCover,
      songList,
      currentIndex: newIndex,
      autoPlay: true
    },
    replace: true
  });
};