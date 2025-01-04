import React, { useState } from 'react';
import './EmojiPicker.css';

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', 
  '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐',
  '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵'
];

function EmojiPicker({ onEmojiSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="emoji-picker-container">
      <button 
        className="emoji-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        😀
      </button>
      {isOpen && (
        <div className="emoji-picker">
          {EMOJI_LIST.map((emoji, index) => (
            <span
              key={index}
              className="emoji-item"
              onClick={() => {
                onEmojiSelect(emoji);
                setIsOpen(false);
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmojiPicker; 