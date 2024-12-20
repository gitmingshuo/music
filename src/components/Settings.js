import React, { useState } from 'react';
import BackButton from './BackButton';
import { useUser } from '../context/UserContext';
import './Settings.css';

function Settings() {
  const { currentUser, updateUserSettings } = useUser();
  const [bio, setBio] = useState(currentUser?.settings?.bio || '');

  const handleSaveBio = () => {
    const currentSettings = currentUser?.settings || {};
    updateUserSettings({
      ...currentSettings,
      bio: bio
    });
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <BackButton />
        <h1>个人设置</h1>
      </div>
      
      <div className="settings-content">
        <div className="settings-section">
          <h3>账号设置</h3>
          <div className="settings-item">
            <span>用户名</span>
            <span>{currentUser?.username || '未设置'}</span>
          </div>
          <div className="settings-item">
            <span>邮箱</span>
            <span>{currentUser?.email || '未设置'}</span>
          </div>
        </div>

        <div className="settings-section">
          <h3>个人简介</h3>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="写点什么来介绍自己..."
          />
          <button onClick={handleSaveBio}>保存</button>
        </div>
      </div>
    </div>
  );
}

export default Settings; 