import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMusic } from '../context/MusicContext';
import { FaRegClock, FaRegChartBar, FaPalette, FaKeyboard, FaVolumeUp, FaInfoCircle, FaDesktop, FaUser } from 'react-icons/fa';
import AvatarPicker from './AvatarPicker';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../utils/userStorage';
import './UserSettings.css';

function UserSettings({ onClose }) {
  const { theme, toggleTheme } = useTheme();
  const { 
    playStats, 
    startTimer, 
    shortcuts,
    timeRemaining,
    defaultVolume,
    setDefaultVolume,
    autoPlay,
    setAutoPlay,
    crossfade,
    setCrossfade,
    clearRecentPlays,
    toggleMiniMode
  } = useMusic();
  const { user, login } = useAuth();
  const [selectedTimer, setSelectedTimer] = useState(null);
  const [activeTab, setActiveTab] = useState('theme');
  
  const [historyClearInterval, setHistoryClearInterval] = useState(() => 
    localStorage.getItem('historyClearInterval') || 'never'
  );
  const [maxHistoryItems, setMaxHistoryItems] = useState(() => 
    parseInt(localStorage.getItem('maxHistoryItems')) || 100
  );

  const [fontSize, setFontSize] = useState(() => 
    localStorage.getItem('fontSize') || 'medium'
  );
  const [enableAnimations, setEnableAnimations] = useState(() => 
    localStorage.getItem('enableAnimations') !== 'false'
  );
  const [showTranslation, setShowTranslation] = useState(() => 
    localStorage.getItem('showTranslation') === 'true'
  );
  const [isMiniModeEnabled, setIsMiniModeEnabled] = useState(() => 
    localStorage.getItem('isMiniModeEnabled') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('historyClearInterval', historyClearInterval);
    localStorage.setItem('maxHistoryItems', maxHistoryItems);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('enableAnimations', enableAnimations);
    localStorage.setItem('showTranslation', showTranslation);
    localStorage.setItem('isMiniModeEnabled', isMiniModeEnabled);
  }, [historyClearInterval, maxHistoryItems, fontSize, enableAnimations, showTranslation, isMiniModeEnabled]);

  const clearAllHistory = () => {
    if (window.confirm('确定要清除所有播放历史吗？')) {
      localStorage.removeItem('recentPlays');
      clearRecentPlays();
    }
  };

  const showChangelog = () => {
    alert('版本更新日志\n1.0.0: 初始版本发布');
  };

  const showLicenses = () => {
    alert('MIT License\nCopyright (c) 2024');
  };

  const clearCache = () => {
    if (window.confirm('确定要清除缓存吗？')) {
      localStorage.clear();
      alert('缓存已清除，需要刷新页面');
      window.location.reload();
    }
  };

  // 格式化播放时间
  const formatPlayTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分钟`;
  };

  const handleAvatarChange = (newAvatar) => {
    const updatedUser = updateUser(user.id, { avatar: newAvatar });
    if (updatedUser) {
      login(updatedUser); // 更新当前用户信息
    }
  };

  const tabs = [
    { id: 'theme', name: '主题', icon: <FaPalette /> },
    { id: 'stats', name: '统计', icon: <FaRegChartBar /> },
    { id: 'timer', name: '定时', icon: <FaRegClock /> },
    { id: 'shortcuts', name: '快捷键', icon: <FaKeyboard /> },
    { id: 'audio', name: '音频', icon: <FaVolumeUp /> },
    { id: 'interface', name: '界面', icon: <FaDesktop /> },
    { id: 'about', name: '关于', icon: <FaInfoCircle /> },
    { id: 'profile', name: '个人资料', icon: <FaUser /> }
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

      case 'audio':
        return (
          <div className="settings-section">
            <h3>音频设置</h3>
            <div className="audio-settings">
              <div className="setting-item">
                <span>默认音量</span>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={defaultVolume}
                  onChange={(e) => setDefaultVolume(e.target.value)}
                />
              </div>
              <div className="setting-item">
                <span>自动播放</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={autoPlay}
                    onChange={(e) => setAutoPlay(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <span>淡入淡出效果</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={crossfade}
                    onChange={(e) => setCrossfade(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'playlist':
        return (
          <div className="settings-section">
            <h3>播放列表设置</h3>
            <div className="playlist-settings">
              <div className="setting-item">
                <span>自动清除播放历史</span>
                <select value={historyClearInterval} onChange={(e) => setHistoryClearInterval(e.target.value)}>
                  <option value="never">从不</option>
                  <option value="daily">每天</option>
                  <option value="weekly">每周</option>
                  <option value="monthly">每月</option>
                </select>
              </div>
              <div className="setting-item">
                <span>最大播放历史数量</span>
                <input 
                  type="number" 
                  min="10" 
                  max="1000"
                  value={maxHistoryItems}
                  onChange={(e) => setMaxHistoryItems(e.target.value)}
                />
              </div>
              <button className="danger-btn" onClick={clearAllHistory}>
                清除所有播放历史
              </button>
            </div>
          </div>
        );

      case 'interface':
        return (
          <div className="settings-section">
            <h3>界面设置</h3>
            <div className="interface-settings">
              <div className="setting-item">
                <span>启用迷你播放器</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={isMiniModeEnabled}
                    onChange={(e) => {
                      setIsMiniModeEnabled(e.target.checked);
                      toggleMiniMode(e.target.checked);
                    }}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <span>字体大小</span>
                <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </select>
              </div>
              <div className="setting-item">
                <span>动画效果</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={enableAnimations}
                    onChange={(e) => setEnableAnimations(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <span>显示歌词翻译</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={showTranslation}
                    onChange={(e) => setShowTranslation(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="settings-section">
            <h3>关于</h3>
            <div className="about-content">
              <div className="app-info">
                <h4>将の音乐</h4>
                <p>版本: 1.0.0</p>
                <p>作者: Your Name</p>
              </div>
              <div className="links">
                <a href="https://github.com/gitmingshuo" target="_blank">GitHub</a>
                <a href="#" onClick={showChangelog}>更新日志</a>
                <a href="#" onClick={showLicenses}>开源协议</a>
              </div>
              <div className="storage-info">
                <p>缓存大小: 128MB</p>
                <button onClick={clearCache}>清除缓存</button>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="settings-section">
            <h3>个人资料</h3>
            <div className="profile-settings">
              <div className="current-avatar">
                <span>当前头像</span>
                <div className="avatar-display">
                  {user.avatar}
                </div>
              </div>
              <AvatarPicker 
                currentAvatar={user.avatar}
                onSelect={handleAvatarChange}
              />
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