import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMusic } from '../context/MusicContext';
import { FaRegClock, FaRegChartBar, FaPalette, FaKeyboard } from 'react-icons/fa';
import './UserSettings.css';

function UserSettings({ onClose }) {
  const { theme, toggleTheme } = useTheme();
  const { 
    playStats, 
    startTimer, 
    shortcuts,
    timeRemaining
  } = useMusic();
  const [selectedTimer, setSelectedTimer] = useState(null);
  const [activeTab, setActiveTab] = useState('theme');

  // 格式化播放时间
  const formatPlayTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分钟`;
  };

  const tabs = [
    { id: 'theme', name: '主题', icon: <FaPalette /> },
    { id: 'stats', name: '统计', icon: <FaRegChartBar /> },
    { id: 'timer', name: '定时', icon: <FaRegClock /> },
    { id: 'shortcuts', name: '快捷键', icon: <FaKeyboard /> }
  ];

  const timerOptions = [
    { label: '15分钟', value: 15 },
    { label: '30分钟', value: 30 },
    { label: '60分钟', value: 60 },
    { label: '90分钟', value: 90 }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'theme':
        return (
          <div className="settings-section">
            <h3>主题设置</h3>
            <div className="theme-options">
              <button 
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => toggleTheme('dark')}
              >
                深色主题
              </button>
              <button 
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => toggleTheme('light')}
              >
                浅色主题
              </button>
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="settings-section">
            <h3>播放统计</h3>
            <div className="stats-info">
              <div className="stat-item">
                <span>总播放时长</span>
                <span>{formatPlayTime(playStats.totalPlayTime)}</span>
              </div>
              <div className="stat-item">
                <span>最近播放</span>
                <span>{playStats.recentPlayed.length}首</span>
              </div>
              <div className="stat-item">
                <span>本周播放</span>
                <span>{playStats.weeklyPlays}首</span>
              </div>
              <div className="stat-item">
                <span>本次播放</span>
                <span>{playStats.currentSession}首</span>
              </div>
            </div>
          </div>
        );

      case 'timer':
        return (
          <div className="settings-section">
            <h3>定时关闭</h3>
            <div className="timer-options">
              {timerOptions.map(option => (
                <button
                  key={option.value}
                  className={`timer-btn ${selectedTimer === option.value ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTimer(option.value);
                    startTimer(option.value);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {selectedTimer && timeRemaining > 0 && (
              <div className="timer-status">
                剩余时间：{Math.floor(timeRemaining / 60000)}分钟
              </div>
            )}
          </div>
        );

      case 'shortcuts':
        return (
          <div className="settings-section">
            <h3>快捷键设置</h3>
            <div className="shortcuts-list">
              {Object.entries(shortcuts).map(([key, value]) => (
                <div key={key} className="shortcut-item">
                  <span>{key}</span>
                  <kbd>{value}</kbd>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-modal">
      <div className="settings-content">
        <div className="settings-header">
          <h2>设置</h2>
          <button className="close-btn-small" onClick={onClose}>×</button>
        </div>

        <div className="settings-layout">
          <div className="settings-sidebar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          <div className="settings-main">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSettings; 