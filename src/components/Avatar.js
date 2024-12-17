import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import './Avatar.css';

function Avatar() {
  const { currentUser, updateUserAvatar } = useUser();
  const [showUpload, setShowUpload] = useState(false);

  const handleAvatarClick = () => {
    setShowUpload(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('文件大小不能超过5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('只能上传图片文件');
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateUserAvatar(e.target.result);
        setShowUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="avatar-container" onClick={handleAvatarClick}>
      <div className="avatar">
        {currentUser?.avatar ? (
          <img src={currentUser.avatar} alt="用户头像" />
        ) : (
          <div className="avatar-placeholder">
            {currentUser?.username?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {showUpload && (
        <div className="avatar-upload-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-content">
            <h3>更换头像</h3>
            <div className="upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload">选择图片</label>
            </div>
            <button onClick={() => setShowUpload(false)}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Avatar;