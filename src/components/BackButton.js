//用来创建一个返回按钮
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BackButton.css';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = (e) => {
    e.stopPropagation();
    
    // 添加调试日志
    console.log('当前路径:', location.pathname);
    console.log('路由状态:', location.state);
    console.log('历史记录:', window.history);
    
    try {
      navigate(-1);
      
      // 添加延时检查
      setTimeout(() => {
        console.log('导航后的路径:', window.location.pathname);
        // 如果导航失败，返回首页
        if (window.location.pathname === location.pathname) {
          console.log('返回失败，重定向到首页');
          navigate('/');
        }
      }, 100);
    } catch (error) {
      console.error('返回操作失败:', error);
      navigate('/');
    }
  };

  return (
    <div className="back-button-wrapper">
      <button className="back-button" onClick={handleBack}>
        <span className="back-icon">←</span>
      </button>
    </div>
  );
};

export default BackButton;