import React from 'react';
import './Comments.css';
import { Comments } from '../data/Comments.js';

function CommentsSection({ songName }) {
  const songComments = Comments[songName] || [];
  
  return (
    <div className="comments-section">
      <h2>评论区</h2>
      <div className="comments-container">
        {songComments.map(comment => (
          <div key={comment.id} className="comment-item">
            <div className="comment-avatar">
              <img src={comment.avatar} alt="avatar" />
            </div>
            <div className="comment-content">
              <div className="comment-header">
                <span className="username">{comment.username}</span>
                <span className="time">{comment.time}</span>
              </div>
              <p className="comment-text">{comment.content}</p>
              <div className="comment-footer">
                <button className="like-button">
                  <span className="like-icon">♥</span>
                  <span className="like-count">{comment.likes}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentsSection;