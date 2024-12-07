//处理歌曲点击播放的逻辑
import { albums } from '../Home';

export const handleSongClick = async (song, navigate) => {
  const albumInfo = albums.find(album => album.name === song.album);
  
  try {
    const defaultLyrics = {
      title: song.name,
      artist: "周杰伦",
      lyrics: [{ time: 0, text: "加载歌词中..." }]
    };

    let lyrics = defaultLyrics;
    
    try {
      const response = await fetch(`/lyrics/${encodeURIComponent(song.name)}.json`);
      if (response.ok) {
        lyrics = await response.json();
      }
    } catch (error) {
      console.warn('歌词加载失败，使用默认歌词');
    }

    navigate(`/song/${encodeURIComponent(song.name)}`, {
      state: {
        song: song.name,
        lyrics: lyrics.lyrics,
        audio: `/music/最伟大的作品.mp3`,
        albumName: song.album,
        albumCover: song.cover,
        songList: albumInfo.songs,
        currentIndex: albumInfo.songs.indexOf(song.name)
      }
    });
  } catch (error) {
    console.error('页面跳转失败:', error);
    alert('暂时无法播放该歌曲，请稍后再试');
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