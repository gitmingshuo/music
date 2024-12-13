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
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // 创建一个图片元素来获取图片尺寸
        const img = new Image();
        img.onload = () => {
          // 创建 canvas 来调整图片大小
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // 设置统一的头像大小
          const size = 100;
          canvas.width = size;
          canvas.height = size;
          
          // 计算裁剪区域（保持图片比例）
          const scale = Math.max(size / img.width, size / img.height);
          const x = (size - img.width * scale) / 2;
          const y = (size - img.height * scale) / 2;
          
          // 绘制并裁剪图片
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          
          // 转换为 base64 并更新头像
          const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
          updateUserAvatar(resizedImage);
          setShowUpload(false);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="avatar-container">
      <div className="avatar" onClick={handleAvatarClick}>
        {currentUser?.avatar ? (
          <img src={currentUser.avatar} alt="用户头像" />
        ) : (
          <div className="avatar-placeholder">
            {currentUser?.username?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>
      
      {showUpload && (
        <div className="avatar-upload-modal">
          <div className="modal-content">
            <h3>更换头像</h3>
            <div className="upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload">
                选择图片
              </label>
            </div>
            <button onClick={() => setShowUpload(false)}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Avatar;