import React from 'react';
import './AvatarPicker.css';

const AVATAR_EMOJIS = [
  '😊', '😎', '🤓', '🤠', '😇', 
  '🦁', '🐯', '🐼', '🐨', '🐸',
  '🌟', '⭐', '🌙', '☀️', '🌈',
  '🎮', '🎧', '🎵', '🎶', '🎹'
];

function AvatarPicker({ currentAvatar, onSelect }) {
  return (
    <div className="avatar-picker">
      <h4>选择头像</h4>
      <div className="avatar-grid">
        {AVATAR_EMOJIS.map((emoji, index) => (
          <div 
            key={index}
            className={`avatar-option ${currentAvatar === emoji ? 'selected' : ''}`}
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AvatarPicker; 