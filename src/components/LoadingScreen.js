import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

function LoadingScreen({ onLoadingComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 模拟最小加载时间，确保动画流畅
    const minLoadingTime = setTimeout(() => {
      setFadeOut(true);
      // 等待淡出动画完成后再触发完成回调
      setTimeout(() => {
        onLoadingComplete?.();
      }, 300);
    }, 800);

    return () => clearTimeout(minLoadingTime);
  }, [onLoadingComplete]);

  return (
    <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
      <img 
        src="/logo.png" 
        alt="Logo" 
        className="loading-logo"
      />
      <div className="loading-spinner" />
    </div>
  );
}

export default LoadingScreen; 