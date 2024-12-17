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
    
    if (location.pathname === '/') {
      return; // 如果已经在首页则不执行任何操作
    }
    try {
      navigate(-1);
    } catch {
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