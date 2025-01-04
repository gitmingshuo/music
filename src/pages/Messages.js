import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessage } from '../context/MessageContext';
import { isFollowing, followUser, unfollowUser } from '../utils/userStorage';
import './Messages.css';

function Messages() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [newMessageUsername, setNewMessageUsername] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isFollowed, setIsFollowed] = useState(false);
  
  const { user } = useAuth();
  const { 
    conversations, 
    sendMessage, 
    fetchConversations,
    searchUsers,
    loadChatMessages
  } = useMessage();

  useEffect(() => {
    if (selectedUser) {
      setIsFollowed(isFollowing(user.id, selectedUser.id));
    }
  }, [selectedUser, user.id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;
    
    const success = await sendMessage(selectedUser.id, message);
    if (success) {
      setMessage('');
      const messages = loadChatMessages(selectedUser.id);
      setChatMessages(messages);
    }
  };

  const handleNewMessage = async () => {
    if (!newMessageUsername.trim()) {
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
      const messages = loadChatMessages(foundUser.id);
      setChatMessages(messages);
      setIsFollowed(isFollowing(user.id, foundUser.id));
    } catch (error) {
      console.error('查找用户失败:', error);
      setSearchError('查找用户失败，请稍后重试');
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedUser(conv.user);
    const messages = loadChatMessages(conv.user.id);
    setChatMessages(messages);
    setIsFollowed(isFollowing(user.id, conv.user.id));
  };

  const handleFollow = () => {
    if (!selectedUser) return;
    
    if (isFollowed) {
      unfollowUser(user.id, selectedUser.id);
    } else {
      followUser(user.id, selectedUser.id);
    }
    setIsFollowed(!isFollowed);
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

        <div className="conversations">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${selectedUser?.id === conv.user.id ? 'active' : ''}`}
              onClick={() => handleSelectConversation(conv)}
            >
              <img src={conv.user.avatar || '/default-avatar.png'} alt="avatar" />
              <div className="conversation-info">
                <span className="username">{conv.user.username}</span>
                <span className="last-message">{conv.lastMessage}</span>
              </div>
              {conv.unreadCount > 0 && (
                <span className="unread-count">{conv.unreadCount}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-area">
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
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}
                >
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入消息..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>发送</button>
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