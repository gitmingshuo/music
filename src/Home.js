import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from './context/MusicContext';
import { FaPlay } from 'react-icons/fa';
import './Home.css';
import { Link } from 'react-router-dom';

export const albums = [
    {
      name: '最伟大的作品',
      year: '2022',
      cover: '/static/media/最伟大的作品.jpg',
      songs: ['最伟大的作品', '不爱我就拉倒', '等你下课', '粉色海洋', '说好不哭', 'mojito', '倒影', '红颜如霜', '错过的烟火', '最伟大的作品（钢琴版）']
    },
    {
      name: 'Jay',
      year: '2000',
      cover: '/static/media/jay.jpg',
      description: '周杰伦的首张专辑《Jay》，将R&B、嘻哈与中国风完美结合，奠定了他的音乐风格。',
      songs: ['可爱女人', '完美主义', '星晴', '娘子', '斗牛', '黑色幽默', '伊斯坦堡', '印第安老斑鸠', '龙卷风', '反方向的钟']
    },
    {
      name: '范特西',
      year: '2001',
      cover: '/static/media/范特西.jpg',
      description: '《范特西》是周杰伦的第二张专辑，以创新的编曲和天马行空的歌词受到广泛好评。',
      songs: ['爱在西元前', '爸我回来了', '简单爱', '忍者', '开不了口', '上海一九四三', '对不起', '威廉古堡', '双截棍', '安静']
    },
    {
      name: '八度空间',
      year: '2002',
      cover: '/static/media/八度空间.jpg',
      songs: ['半兽人', '半岛铁盒', '暗号', '龙拳', '火车叨位去', '手写的从前', '忍者', '分裂', '爷爷泡的茶', '回到过去']
    },
    {
      name: '叶惠美',
      year: '2003',
      cover: '/static/media/叶惠美.jpg',
      description: '以周杰伦母亲的名字命名，《叶惠美》展现了他的音乐成熟度和对家庭的敬意。',
      songs: ['以父之名', '晴天', '三年二班', '东风破', '你听得到', '同一种调调', '她的睫毛', '爱情悬崖', '梯田', '双刀']
    },
    {
      name: '七里香',
      year: '2004',
      cover: '/static/media/七里香.jpg',
      songs: ['我的地盘', '七里香', '借口', '外婆', '将军', '搁浅', '乱舞春秋', '困兽之斗', '园游会', '止战之殇']
    },
    {
      name: '11月的萧邦',
      year: '2005',
      cover: '/static/media/11月的萧邦.jpg',
      songs: ['夜曲', '蓝色风暴', '发如雪', '黑色毛衣', '四面楚歌', '枫', '浪漫手机', '逆鳞', '麦芽糖', '珊瑚海']
    },
    {
      name: '依然范特西',
      year: '2006',
      cover: '/static/media/依然范特西.jpg',
      songs: ['夜的第七章', '听妈妈的话', '千里之外', '本草纲目', '退后', '红模仿', '心雨', '白色风车', '迷迭香', '菊花台']
    },
    {
      name: '我很忙',
      year: '2007',
      cover: '/static/media/我很忙.jpg',
      songs: ['牛仔很忙', '彩虹', '青花瓷', '阳光宅男', '蒲公英的约定', '无双', '我不配', '扯', '甜甜的', '最长的电影']
    },
    {
      name: '魔杰座',
      year: '2008',
      cover: '/static/media/魔杰座.jpg',
      songs: ['龙战骑士', '给我一首歌的时间', '蛇舞', '花海', '魔术先生', '说好的幸福呢', '兰亭序', '流浪诗人', '时光机', '乔克叔叔']
    },
    {
      name: '跨时代',
      year: '2010',
      cover: '/static/media/跨时代.jpg',
      songs: ['跨时代', '说了再见', '烟花易冷', '免费教学录影带', '好久不见', '雨下一整晚', '嘘', '我落泪情绪零碎', '自导自演', '超人不会飞']
    },
    {
      name: '惊叹号',
      year: '2011',
      cover: '/static/media/惊叹号.jpg',
      songs: ['惊叹号', '迷魂曲', '公主病', '你好吗', '疗伤烧肉粽', '琴伤', '水手怕水', '世界末日', '皮影戏', '超跑女神']
    },
    {
      name: '12新作',
      year: '2012',
      cover: '/static/media/12新作.jpg',
      songs: ['四季列车', '手语', '公公偏头痛', '明明就', '傻笑', '比较大的大提琴', '爱你没差', '红尘客栈', '梦想启动', '大笨钟']
    },
    {
      name: '哎呦不错哦',
      year: '2014',
      cover: '/static/media/哎呦不错哦.jpg',
      songs: ['阳明山', '窃爱', '天涯过客', '怎么了', '一口气全念对', '我要夏天', '手写的从前', '鞋子特大号', '听爸爸的话', '美人鱼']
    },
    {
      name: '周杰伦的床边故事',
      year: '2016',
      cover: '/static/media/周杰伦的床边故事.jpg',
      songs: ['床边故事', '说走就走', '一点点', '前世情人', '英雄', '不该', '土耳其冰淇淋', '告白气球', 'now you see me']
    }
  ];
  

  
function Home() {
  const navigate = useNavigate();
  const { addToPlaylist } = useMusic();
  const [currentSlide, setCurrentSlide] = useState(0);

  // 轮播图数据
  const bannerData = [
    {
      id: 1,
      image: '/static/media/jay.jpg',
      title: 'Jay',
      album: 'Jay'
    },
    {
      id: 2,
      image: '/static/media/范特西.jpg',
      title: '范特西',
      album: '范特西'
    },
    {
      id: 3,
      image: '/static/media/最伟大的作品.jpg',
      title: '最伟大的作品',
      album: '最伟大的作品'
    },
  ];

  // 推荐歌单
  const playlists = [
    {
      id: 1,
      name: '红心歌单',
      cover: '/static/media/jay.jpg',
      description: '我喜欢的音乐',
      onClick: () => handlePlaylistClick(1)
    },
    {
      id: 2,
      name: '私人漫游',
      cover: '/static/media/范特西.jpg',
      description: '根据你的口味生成',
      onClick: () => handlePlaylistClick(2)
    },
    {
      id: 3,
      name: 'Jay Chou精选',
      cover: '/static/media/最伟大的作品.jpg',
      description: '周杰伦热门歌曲',
      onClick: () => handlePlaylistClick(3)
    }
  ];

  // 排行榜
  const rankings = [
    {
      id: 1,
      name: '飙升榜',
      songs: albums.slice(0, 3).map(album => ({
        name: album.songs[0],
        album: album.name,
        cover: album.cover
      })),
      onClick: () => handleRankingClick(rankings[0])
    },
    {
      id: 2,
      name: '新歌榜',
      songs: albums.slice(3, 6).map(album => ({
        name: album.songs[0],
        album: album.name,
        cover: album.cover
      })),
      onClick: () => handleRankingClick(rankings[1])
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 处理专辑点击
  const handleAlbumClick = (album) => {
    navigate(`/album/${album.id}`, { state: { album } });
  };

  // 处理排行榜点击
  const handleRankingClick = (ranking) => {
    // 可以直接播放排行榜中的歌曲
    if (ranking.songs && ranking.songs.length > 0) {
      addToPlaylist(ranking.songs[0], ranking.songs);
    }
  };

  // 处理歌单点击
  const handlePlaylistClick = (id) => {
    // 根据id处理点击事件，例如导航到对应的歌单页面
    navigate(`/playlists/${id}`);
  };

  return (
    <div className="home-page">
      {/* 轮播图 */}
      <div className="banner-section">
        <div className="banner-container">
          {bannerData.map((item, index) => (
            <div
              key={item.id}
              className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
              onClick={() => navigate('/albums')}
            >
              <img src={item.image} alt={item.title} />
            </div>
          ))}
          <div className="banner-dots">
            {bannerData.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 推荐歌单 */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">推荐歌单</h2>
          <Link to="/playlists" className="more-link">更多 &gt;</Link>
        </div>
        <div className="playlists-grid">
          {playlists.map(playlist => (
            <div 
              key={playlist.id} 
              className="playlist-card" 
              onClick={() => {
                if (playlist.id === 1) {
                  navigate('/favorites'); // 跳转到 Favorites.js
                } else if (playlist.id === 2) {
                  navigate('/recent-plays'); // 跳转到 RecentPlays.js
                } else if (playlist.id === 3) {
                  navigate('/albums'); // 跳转到 Albums.js
                }
              }}
            >
              <div className="playlist-cover">
                <img src={playlist.cover} alt={playlist.name} />
                <button className="play-btn">
                  <FaPlay />
                </button>
              </div>
              <h3>{playlist.name}</h3>
              <p>{playlist.description}</p>
            </div>
          ))}
        </div>
      </section>

      

      {/* 排行榜 */}
      <section className="section">
        <div className="section-header">
          <h2>排行榜</h2>
          <Link to="/rankings" className="more-link">更多 &gt;</Link>
        </div>
        <div className="rankings-grid">
          <div className="ranking-card" onClick={rankings[0].onClick}>
            <h3>飙升榜</h3>
            <div className="ranking-songs">
              {rankings[0].songs.slice(0, 3).map((song, index) => (
                <div key={index} className="ranking-song-item">
                  <span className="ranking-number">{index + 1}</span>
                  <span className="song-name">{song.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ranking-card" onClick={rankings[1].onClick}>
            <h3>新歌榜</h3>
            <div className="ranking-songs">
              {rankings[1].songs.slice(0, 3).map((song, index) => (
                <div key={index} className="ranking-song-item">
                  <span className="ranking-number">{index + 1}</span>
                  <span className="song-name">{song.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
