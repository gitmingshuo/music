import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import './Settings.css';

function Settings() {
  const { userSettings, updateUserSettings, currentUser } = useUser();
  const [bio, setBio] = useState(userSettings.bio || '');

  const handleSettingChange = (key, value) => {
    updateUserSettings({ [key]: value });
  };

  const handleBioSave = () => {
    updateUserSettings({ bio: bio });
    // 可以添加保存成功的提示
    alert('个人介绍已更新');
  };

  const handleThemeChange = (theme) => {
    handleSettingChange('theme', theme);
    // 实际应用主题
    document.documentElement.setAttribute('data-theme', theme);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>个人设置</h2>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>基本设置</h3>
          <div className="settings-item">
            <span className="item-label">用户名</span>
            <input 
              type="text" 
              value={currentUser?.username} 
              readOnly 
              className="readonly-input"
            />
          </div>
          <div className="settings-item">
            <span className="item-label">个人介绍</span>
            <div className="bio-input-container">
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                placeholder="介绍一下自己吧"
                maxLength={200}
              />
              <button onClick={handleBioSave} className="save-button">
                保存
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>隐私设置</h3>
          <div className="settings-item">
            <span className="item-label">消息提醒</span>
            <label className="switch">
              <input 
                type="checkbox"
                checked={userSettings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="settings-item">
            <span className="item-label">播放记录</span>
            <label className="switch">
              <input 
                type="checkbox"
                checked={userSettings.playHistory}
                onChange={(e) => handleSettingChange('playHistory', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>主题设置</h3>
          <div className="settings-item">
            <span className="item-label">界面主题</span>
            <div className="theme-options">
              <label className="theme-option">
                <input 
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={userSettings.theme === 'dark'}
                  onChange={(e) => handleThemeChange(e.target.value)}
                />
                <span>深色</span>
              </label>
              <label className="theme-option">
                <input 
                  type="radio"
                  name="theme"
                  value="light"
                  checked={userSettings.theme === 'light'}
                  onChange={(e) => handleThemeChange(e.target.value)}
                />
                <span>浅色</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings; 