import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Banner.css';

const Banner = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const bannerData = [
    {
      id: 1,
      image: require('../image/jay.jpg'),
      title: 'Jay',
      album: 'Jay'
    },
    {
      id: 2,
      image: require('../image/范特西.jpg'),
      title: '范特西',
      album: '范特西'
    },
    {
      id: 3,
      image: require('../image/最伟大的作品.jpg'),
      title: 'Jay',
      album: 'Jay'
    },
    
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerData.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="banner">
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
      </div>
      <div className="banner-dots">
        {bannerData.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;