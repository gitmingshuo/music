import React from 'react';
import { useUser } from '../context/UserContext';
import './Profile.css';

function Profile() {
  const { currentUser, updateUserAvatar } = useUser();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const size = 100;
          canvas.width = size;
          canvas.height = size;
          
          const scale = Math.max(size / img.width, size / img.height);
          const x = (size - img.width * scale) / 2;
          const y = (size - img.height * scale) / 2;
          
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          
          const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
          updateUserAvatar(resizedImage);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="头像" />
          ) : (
            <div className="avatar-placeholder">
              {currentUser?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="avatar-upload">
            <input
              type="file"
              id="avatar-input"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="avatar-input" className="upload-button">
              更换头像
            </label>
          </div>
        </div>
        <div className="profile-info">
          <h2>{currentUser?.username}</h2>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">动态</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">关注</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">粉丝</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 