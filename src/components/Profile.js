import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../context/FavoriteContext';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const { currentUser, updateUserAvatar, updateUserSettings } = useUser();
  const { favorites } = useFavorites();
  const { playSong } = usePlayer();
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(currentUser?.settings?.bio || '');

  // 处理头像上传
  const handleAvatarClick = () => setShowUploadModal(true);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateUserAvatar(e.target.result);
        setShowUploadModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // 保存个人简介
  const saveBio = () => {
    updateUserSettings({ ...currentUser.settings, bio });
    setEditingBio(false);
  };

  // 处理歌曲播放
  const handleSongPlay = (song) => {
    const processedSong = {
      ...song,
      url: '/music/我是如此相信.mp3',
      name: song.name || '等你下课',
      artist: song.artist || '周杰伦',
      cover: song.cover || '/path/to/default/cover.jpg'
    };
    playSong(processedSong);
  };

  // 获取最近播放列表
  const getTopSongs = () => {
    const defaultSongs = [
      {
        name: '等你下课',
        artist: '周杰伦',
        cover: '/path/to/cover.jpg',
      }
    ];
    return currentUser?.recentPlays?.slice(0, 5) || defaultSongs;
  };

  return (
    <div className="profile-container">
      {/* 头像和用户名部分 */}
      <div className="profile-header">
        <div className="avatar-section" onClick={handleAvatarClick}>
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="头像" className="profile-avatar" />
          ) : (
            <div className="avatar-placeholder">
              {currentUser?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="avatar-overlay">点击更换头像</div>
        </div>
        <h2>{currentUser?.username}</h2>
      </div>

      {/* 用户数据统计 */}
      <div className="user-stats">
        <div className="stat-item" onClick={() => navigate('/favorites')}>
          <span className="stat-number">{favorites.length}</span>
          <span className="stat-label">收藏歌曲</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{currentUser?.settings?.level || 1}</span>
          <span className="stat-label">等级</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{currentUser?.recentPlays?.length || 0}</span>
          <span className="stat-label">累计播放</span>
        </div>
      </div>

      {/* 个人简介 */}
      <div className="profile-section">
        <h3>个人简介</h3>
        {editingBio ? (
          <div className="bio-edit">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              placeholder="写点什么介绍自己..."
            />
            <div className="bio-actions">
              <button onClick={saveBio}>保存</button>
              <button onClick={() => setEditingBio(false)}>取消</button>
            </div>
          </div>
        ) : (
          <div className="bio-display" onClick={() => setEditingBio(true)}>
            {bio || '点击添加个人简介'}
          </div>
        )}
      </div>

      {/* 最近播放 */}
      <div className="profile-section">
        <h3>最近播放</h3>
        <div className="recent-plays">
          {getTopSongs().map((song, index) => (
            <div 
              key={index} 
              className="song-item" 
              onClick={() => handleSongPlay(song)}
            >
              <span className="song-number">{index + 1}</span>
              <img src={song.cover} alt={song.name} className="song-cover" />
              <div className="song-info">
                <div className="song-name">{song.name}</div>
                <div className="song-artist">{song.artist}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 收藏歌单 */}
      <div className="profile-section">
        <h3>我的歌单</h3>
        <div className="playlist-grid">
          {favorites.length > 0 ? (
            <div 
              className="playlist-card" 
              onClick={() => favorites[0] && handleSongPlay(favorites[0])}
            >
              <img src={favorites[0]?.cover || '/path/to/default/cover.jpg'} alt="我喜欢的音乐" />
              <div className="playlist-info">
                <h4>我喜欢的音乐</h4>
                <span>{favorites.length} 首歌曲</span>
              </div>
            </div>
          ) : (
            <div className="empty-playlist">还没有收藏歌曲</div>
          )}
        </div>
      </div>

      {/* 上传头像模态框 */}
      {showUploadModal && (
        <div className="upload-modal">
          <div className="modal-content">
            <h3>更换头像</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <button onClick={() => setShowUploadModal(false)}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile; 