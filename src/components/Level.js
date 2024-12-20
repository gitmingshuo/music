import React from 'react';
import BackButton from './BackButton';
import { useUser } from '../context/UserContext';
import './Level.css';

function Level() {
  const { currentUser } = useUser();
  
  // 计算等级和经验值，添加默认值
  const exp = currentUser?.exp || 0;
  const level = Math.floor(exp / 100) + 1;
  const currentLevelExp = exp % 100;
  const nextLevelExp = 100 - currentLevelExp;
  const progressPercentage = (currentLevelExp / 100) * 100;

  return (
    <div className="level-container">
      <div className="level-header">
        <BackButton />
        <h1>我的等级</h1>
      </div>
      
      <div className="level-content">
        <div className="level-info">
          <h2>当前等级: {level}</h2>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{width: `${progressPercentage}%`}}
            ></div>
          </div>
          <p>当前经验值: {exp}</p>
          <p>距离下一等级还需要 {nextLevelExp} 经验</p>
        </div>

        <div className="level-rules">
          <h3>如何获得经验</h3>
          <ul>
            <li>每日登录: +10经验</li>
            <li>收听音乐: +1经验/首</li>
            <li>收藏音乐: +5经验/首</li>
            <li>创建歌单: +20经验</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Level; 