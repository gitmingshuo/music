//用来创建一个返回按钮
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = (e) => {
    // 阻止事件冒泡
    e.stopPropagation();
    
    try {
      // 添加调试日志
      console.log('返回按钮被点击');
      
      // 尝试返回上一页
      navigate(-1);
      
      // 如果 navigate(-1) 失败，则返回首页
      setTimeout(() => {
        if (window.location.pathname !== '/') {
          console.log('返回首页');
          navigate('/');
        }
      }, 100);
    } catch (error) {
      console.error('返回操作失败:', error);
      // 发生错误时返回首页
      navigate('/');
    }
  };

  return (
    <div className="back-button-wrapper" onClick={(e) => e.stopPropagation()}>
      <button 
        className="back-button" 
        onClick={handleBack}
        style={{
          padding: '10px 20px',
          background: 'rgba(0, 0, 0, 0.5)',
          border: 'none',
          borderRadius: '20px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          zIndex: 9999,
          position: 'relative'
        }}
      >
        <span className="back-icon" style={{ marginRight: '5px' }}>←</span>
        <span className="back-text">返回</span>
      </button>
    </div>
  );
};

export default BackButton;