import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from './context/MusicContext';
import { FaPlay } from 'react-icons/fa';
import './Home.css';

export const albums = [
    {
      name: 'Jay',
      year: '2000',
      cover: require('./image/jay.jpg'),
      description: '周杰伦的首张专辑《Jay》，将R&B、嘻哈与中国风完美结合，奠定了他的音乐风格。',
      songs: ['可爱女人', '完美主义', '星晴', '娘子', '斗牛', '黑色幽默', '伊斯坦堡', '印第安老斑鸠', '龙卷风', '反方向的钟']
    },
    {
      name: '范特西',
      year: '2001',
      cover: require('./image/范特西.jpg'),
      description: '《范特西》是周杰伦的第二张专辑，以创新的编曲和天马行空的歌词受到广泛好评。',
      songs: ['爱在西元前', '爸我回来了', '简单爱', '忍者', '开不了口', '上海一九四三', '对不起', '威廉古堡', '双截棍', '安静']
    },
    {
      name: '八度空间',
      year: '2002',
      cover: require('./image/八度空间.jpg'),
      
      songs: ['���兽人', '半岛铁盒', '暗号', '龙拳', '火车叨位去', '手写的从前', '忍者', '分裂', '爷爷泡的茶', '回到过去']
    },
    {
      name: '叶惠美',
      year: '2003',
      cover: require('./image/叶惠美.jpg'),
      description: '以周杰伦母亲的名字命名，《叶惠美》展现���他的音乐成熟度和对家庭的敬意。',
      songs: ['以父之名', '晴天', '三年二班', '东风破', '你听得到', '同一种调调', '她的睫毛', '爱情悬崖', '梯田', '双刀']
    },
    {
      name: '七里香',
      year: '2004',
      cover: require('./image/七里香.jpg'),
      description: '《七里香》充满浪漫与诗意，是周杰伦音乐生涯中的经典之作。',
      songs: ['我的地盘', '七里香', '借口', '外婆', '将军', '搁浅', '乱舞春秋', '困兽之斗', '园游会', '止战之殇']
    },
    {
      name: '十一月的萧邦',
      year: '2005',
      cover: require('./image/11月的萧邦.jpg'),
      description: '《十一月的萧邦》融合古典与流行，展现了周杰伦对音乐的无限创作力',
      songs: ['夜曲', '蓝色风暴', '发如雪', '黑色毛衣', '四面楚歌', '枫', '浪漫手机', '逆鳞', '麦芽糖', '珊瑚海', '飘移', '一路向北']
    },
    {
      name: '依然范特西',
      year: '2006',
      cover: require('./image/依然范特西.jpg'),
      description: '《依然范特西》延续了《范特西》的风格，并加入了更多情感与故事性。',
      songs: ['夜的第七章', '听妈妈的话', '千里之外', '本草纲目', '退后', '红模仿', '心雨', '白色风车', '迷迭香', '菊花台']
    },
    {
      name: '我很忙',
      year: '2007',
      cover: require('./image/我很忙.jpg'),
      description: '《我很忙》是一张多元化的专辑，展示了周杰伦尝试更多风格的勇气。',
      songs: ['牛仔很忙', '彩虹', '青花瓷', '阳光宅男', '蒲公英的约定', '无双', '我不配', '扯', '甜甜的', '最长的电影']
    },
    {
      name: '魔杰座',
      year: '2008',
      cover: require('./image/魔杰座.jpg'),
      description: '《魔杰座》以"魔术"为主题，融合了奇幻与音乐创作的多样性。',
      songs: ['龙战骑士', '给我一首歌的时间', '蛇舞', '花海', '魔术先生', '说好的幸福呢', '兰亭序', '流浪诗人', '时光机', '乔克叔叔']
    },
    {
      name: '跨时代',
      year: '2010',
      cover: require('./image/跨时代.jpg'),
      description: '《跨时代》充满未来感，展示了周杰伦对音乐创新的追求。',
      songs: ['跨时代', '说了再见', '烟花易冷', '免费教学录影带', '好久不见', '雨下一整晚', '嘻哈空姐', '我落泪情绪零碎', '爱的飞行日记', '自导自演']
    },
    {
      name: '惊叹号',
      year: '2011',
      cover: require('./image/惊叹号.jpg'),
      description: '《惊叹号》带有极强的节奏感，是一张充���活力的专辑。',
      songs: ['惊叹号', '迷魂曲', '皮影戏', '超人不会飞', '琴伤', '水手怕水', '世界末日', '你好吗', '公主病', '非常幸运', '米兰的小铁匠']
    },
    {
      name: '十二新作',
      year: '2012',
      cover: require('./image/12新作.jpg'),
      description: '《十二新作》以经典风格回归，包含多首热门金曲。',
      songs: ['四季列车', '手语', '公公偏头痛', '明明就', '傻笑', '比较大的大提琴', '爱你没差', '红尘客栈', '梦想启动', '大笨钟', '哪里都是你', '气球']
    },
    {
      name: '哎呦，不错哦',
      year: '2014',
      cover: require('./image/哎呦不错哦.jpg'),
      description: '《哎呦，不错哦》是周伦结婚后发行的专，展现了更成熟的情感。',
      songs: ['阳明山', '窃爱', '天涯过客', '怎么了', '手写的从前', '美人鱼', '听��爸的话', '算什么男人', '我要夏天']
    },
    {
      name: '周杰伦的床边故事',
      year: '2016',
      cover: require('./image/周杰伦的床边故事.jpg'),
      description: '《床边故事》以叙事为核心，展现了周杰伦的音乐创作深度。',
      songs: ['床边故事', '说走就走', '一点点', '前世情人', '英雄', '不该', '土耳其冰淇淋', '告白气球', 'Now You See Me', '爱情废柴']
    },
    {
      name: '最伟大的作品',
      year: '2022',
      cover: require('./image/最伟大的作品.jpg'),
      description: '《最伟大的作品》是一张跨越时空的音乐杰作，充满了对艺术的敬意。',
      songs: ['最伟大的作品', '红颜如霜', '不爱我就拉倒', '等你下课', '我是如此相信', '说好不哭', 'mojito', '倒影', '粉色海洋', '错过的烟火','Intro', '还在流浪']
    },
  ];
  
const defaultAlbum = {
  name: '最伟大的作品',
  year: '2022',
  cover: require('./image/最伟大的作品.jpg'),
  description: '《最伟大的作品》是周杰伦第十五张录音室专辑',
  songs: [
    '最伟大的作品',
    '红颜如霜',
    '不爱我就拉倒',
    '等你下课',
    '我是如此相信',
    '说好不哭',
    'mojito',
    '倒影',
    '粉色海洋',
    '错过的烟火',
    'Intro',
    '还在流浪'
  ]
};
  
function Home() {
  const navigate = useNavigate();
  const { addToPlaylist } = useMusic();
  const [currentSlide, setCurrentSlide] = useState(0);

  // 轮播图数据
  const bannerData = [
    {
      id: 1,
      image: require('./image/jay.jpg'),
      title: 'Jay',
      album: 'Jay'
    },
    {
      id: 2,
      image: require('./image/范特西.jpg'),
      title: '范特西',
      album: '范特西'
    },
    {
      id: 3,
      image: require('./image/最伟大的作品.jpg'),
      title: '最伟大的作品',
      album: '最伟大的作品'
    },
  ];

  // 推荐歌单
  const playlists = [
    {
      id: 1,
      name: '红心歌单',
      cover: require('./image/jay.jpg'),
      description: '我喜欢的音乐'
    },
    {
      id: 2,
      name: '私人漫游',
      cover: require('./image/范特西.jpg'),
      description: '根据你的口味生成'
    },
    {
      id: 3,
      name: 'Jay Chou精选',
      cover: require('./image/最伟大的作品.jpg'),
      description: '周杰伦热门歌曲'
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
      }))
    },
    {
      id: 2,
      name: '新歌榜',
      songs: albums.slice(3, 6).map(album => ({
        name: album.songs[0],
        album: album.name,
        cover: album.cover
      }))
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home-page">
      {/* 轮播图 */}
      <div className="banner-section">
        <div className="banner-container">
          {bannerData.map((item, index) => (
            <div
              key={item.id}
              className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
              onClick={() => navigate(`/album/${item.album}`)}
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
          <h2>推荐歌单</h2>
          <span className="more" onClick={() => navigate('/playlists')}>更多 &gt;</span>
        </div>
        <div className="playlists-grid">
          {playlists.map(playlist => (
            <div key={playlist.id} className="playlist-card">
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
          <span className="more" onClick={() => navigate('/rankings')}>更多 &gt;</span>
        </div>
        <div className="rankings-grid">
          {rankings.map(ranking => (
            <div key={ranking.id} className="ranking-card">
              <h3>{ranking.name}</h3>
              <div className="ranking-songs">
                {ranking.songs.map((song, index) => (
                  <div key={index} className="ranking-song-item">
                    <span className="rank-number">{index + 1}</span>
                    <img src={song.cover} alt={song.name} />
                    <div className="song-info">
                      <div className="song-name">{song.name}</div>
                      <div className="song-album">{song.album}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
