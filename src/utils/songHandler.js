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
        audio: albumInfo.name === "最伟大的作品" ? `/music/${encodeURIComponent(song.name)}.mp3` : "/music/最伟大的作品.mp3",
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