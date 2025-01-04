import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessage } from '../context/MessageContext';
import { isFollowing, followUser, unfollowUser } from '../utils/userStorage';
import './Messages.css';
import { useNavigate } from 'react-router-dom';
import EmojiPicker from '../components/EmojiPicker';

function Messages() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [newMessageUsername, setNewMessageUsername] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isFollowed, setIsFollowed] = useState(false);
  const [sending, setSending] = useState(false);
  
  const { user } = useAuth();
  const { 
    conversations, 
    sendMessage, 
    fetchConversations,
    searchUsers,
    loadChatMessages,
    currentMessages,
    loading
  } = useMessage();
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  useEffect(() => {
    if (selectedUser) {
      scrollToBottom();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (selectedUser) {
      setIsFollowed(isFollowing(user.id, selectedUser.id));
    }
  }, [selectedUser, user.id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser || !user || sending) return;
    
    try {
      setSending(true);
      const success = await sendMessage(selectedUser.id, message);
      if (success) {
        setMessage('');
        loadChatMessages(selectedUser.id);
      } else {
        console.error('消息发送失败');
      }
    } finally {
      setSending(false);
    }
  };

  const handleNewMessage = async () => {
    if (!user || !newMessageUsername.trim()) {
      setSearchError('请输入用户名');
      return;
    }

    try {
      setSearchError('');
      const foundUser = await searchUsers(newMessageUsername);
      
      if (!foundUser) {
        setSearchError('未找到该用户');
        return;
      }

      if (foundUser.id === user.id) {
        setSearchError('不能给自己发送消息');
        return;
      }

      setSelectedUser(foundUser);
      setShowNewMessage(false);
      setNewMessageUsername('');
      loadChatMessages(foundUser.id);
      setIsFollowed(isFollowing(user.id, foundUser.id));
    } catch (error) {
      console.error('查找用户失败:', error);
      setSearchError('查找用户失败，请稍后重试');
    }
  };

  const handleSelectConversation = (conv) => {
    if (!conv?.user || !user) return;
    
    setSelectedUser(conv.user);
    loadChatMessages(conv.user.id);
    setIsFollowed(isFollowing(user.id, conv.user.id));
  };

  const handleFollow = () => {
    if (!selectedUser || !user) return;
    
    if (isFollowed) {
      unfollowUser(user.id, selectedUser.id);
    } else {
      followUser(user.id, selectedUser.id);
    }
    setIsFollowed(!isFollowed);
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
  };

  return (
    <div className="messages-container">
      <div className="conversations-list">
        <div className="conversations-header">
          <h2>消息</h2>
          <button 
            className="new-message-btn"
            onClick={() => setShowNewMessage(true)}
          >
            新建消息
          </button>
        </div>
        
        {showNewMessage && (
          <div className="new-message-form">
            <input
              type="text"
              value={newMessageUsername}
              onChange={(e) => setNewMessageUsername(e.target.value)}
              placeholder="输入用户名..."
            />
            <button onClick={handleNewMessage}>查找</button>
            {searchError && <div className="error-message">{searchError}</div>}
          </div>
        )}

        {loading && <div className="loading-indicator">加载中...</div>}
        <div className="conversations">
          {conversations?.map((conv) => (
            conv?.user && (
              <div
                key={conv.id}
                className={`conversation-item ${selectedUser?.id === conv.user.id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className="user-avatar">
                  {conv.user.avatar}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <span className="username">{conv.user.username}</span>
                    {conv.unreadCount > 0 && (
                      <span className="unread-count">{conv.unreadCount}</span>
                    )}
                  </div>
                  <span className="last-message">
                    {conv.lastMessage || '暂无消息'}
                  </span>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="chat-area">
        {loading && <div className="loading-indicator">加载中...</div>}
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <h3>{selectedUser.username}</h3>
                <button 
                  className={`follow-btn ${isFollowed ? 'following' : ''}`}
                  onClick={handleFollow}
                >
                  {isFollowed ? '已关注' : '关注'}
                </button>
              </div>
            </div>
            
            <div className="messages-list">
              {currentMessages && currentMessages.map((msg) => (
                msg && user && (
                  <div 
                    key={msg.id}
                    className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">{msg.content}</div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                )
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入消息..."
                onKeyPress={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
                disabled={sending}
              />
              <button 
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
              >
                {sending ? '发送中...' : '发送'}
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            选择一个联系人开始聊天
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages; 