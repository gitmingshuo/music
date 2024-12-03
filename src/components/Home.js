import { useState, useEffect } from 'react';
import { BsPlayFill } from 'react-icons/bs';  // 改用更纤细的图标

const bannerImages = [
  {
    url: '/images/banner1.jpg',
    title: '叶惠美',
    id: 1
  },
  {
    url: '/images/banner2.jpg', 
    title: '范特西',
    id: 2
  },
  {
    url: '/images/banner3.jpg',
    title: '八度空间',
    id: 3
  },
  {
    url: '/images/banner4.jpg',
    title: 'Jay',
    id: 4
  }
];

function Home() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home-container">
      <div className="banner-section">
        <div className="banner-container">
          {bannerImages.map((banner, index) => (
            <div
              key={banner.id}
              className={`banner-slide ${index === currentBanner ? 'active' : ''}`}
            >
              <img src={banner.url} alt={banner.title} />
            </div>
          ))}
        </div>
      </div>
      {/* 其他内容 */}
    </div>
  );
}

export default Home;