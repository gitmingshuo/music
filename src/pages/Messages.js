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
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { 
    conversations, 
    sendMessage, 
    fetchConversations,
    searchUsers,
    loadChatMessages,
    currentMessages,
    currentChat,
    updateConversation,
  } = useMessage();
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);
  const messagesListRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const isNearBottom = () => {
    const container = messagesListRef.current;
    if (!container) return false;
    
    const threshold = 150;
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };

  const handleScroll = () => {
    setShouldAutoScroll(isNearBottom());
  };

  const scrollToBottom = () => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  useEffect(() => {
    const messagesList = messagesListRef.current;
    if (messagesList) {
      messagesList.addEventListener('scroll', handleScroll);
      return () => messagesList.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, shouldAutoScroll]);

  useEffect(() => {
    if (currentMessages?.length > 0) {
      console.log('Messages updated:', {
        count: currentMessages.length,
        messages: currentMessages
      });
      if (currentMessages[currentMessages.length - 1]?.senderId === user?.id) {
        scrollToBottom();
      }
    }
  }, [currentMessages, user?.id]);

  useEffect(() => {
    if (selectedUser) {
      // 不再自动滚动
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

  useEffect(() => {
    const adjustScroll = () => {
      const messagesList = document.querySelector('.messages-list');
      if (messagesList) {
        messagesList.scrollTop = messagesList.scrollHeight * 0.2;
      }
    };

    if (selectedUser) {
      setTimeout(adjustScroll, 100);
    }
  }, [selectedUser]);

  useEffect(() => {
    const initializeConversations = async () => {
      if (user) {
        try {
          await fetchConversations();
        } catch (error) {
          console.error('Failed to load conversations:', error);
        }
      }
    };

    initializeConversations();
  }, [user, fetchConversations]);

  const handleSendMessage = async () => {
    console.log('Sending message - Validation:', {
      hasMessage: !!message.trim(),
      selectedUser,
      currentChat,
      currentUserId: user?.id
    });

    if (!message.trim() || !selectedUser || !user || sending) {
      console.error('Send message validation failed');
      return;
    }
    
    try {
      setSending(true);
      const success = await sendMessage(selectedUser.id, message);
      if (success) {
        setMessage('');
        setTimeout(() => {
          const messagesList = document.querySelector('.messages-list');
          if (messagesList) {
            messagesList.scrollTop = messagesList.scrollHeight;
          }
        }, 100);
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
      setLoading(true);
      
      const foundUser = await searchUsers(newMessageUsername);
      
      if (!foundUser) {
        setSearchError('未找到该用户');
        return;
      }

      if (foundUser.id === user.id) {
        setSearchError('不能给自己发送消息');
        return;
      }

      const existingConv = conversations?.find(
        conv => conv.user?.id === foundUser.id
      );

      if (!existingConv) {
        const newConv = {
          id: `${user.id}-${foundUser.id}`,
          userId: user.id,
          otherUserId: foundUser.id,
          user: foundUser,
          lastMessage: '',
          timestamp: new Date().toISOString(),
          unreadCount: 0
        };
        
        try {
          await updateConversation(newConv);
          await fetchConversations();
        } catch (error) {
          console.error('Error creating new conversation:', error);
          setSearchError('创建会话失败，请稍后重试');
          return;
        }
      }

      setSelectedUser(foundUser);
      setShowNewMessage(false);
      setNewMessageUsername('');
      loadChatMessages(foundUser.id);
    } catch (error) {
      console.error('查找用户失败:', error);
      setSearchError('查找用户失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const scrollToOptimalPosition = () => {
    const messagesList = document.querySelector('.messages-list');
    if (messagesList) {
      messagesList.scrollTop = messagesList.scrollHeight;
    }
  };

  const handleSelectConversation = (conv) => {
    console.log('Selecting conversation:', {
      conversation: conv,
      currentUser: user?.id,
      selectedUserId: conv?.user?.id
    });

    if (!conv?.user || !user) {
      console.error('Invalid conversation selection:', { conv, user });
      return;
    }
    
    setSelectedUser(conv.user);
    loadChatMessages(conv.user.id);
    
    setTimeout(scrollToOptimalPosition, 100);
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
                  <span className="last-message" title={conv.lastMessage}>
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
              </div>
            </div>
            
            <div className="messages-list" ref={messagesListRef}>
              {currentMessages && currentMessages.map((msg) => (
                <div 
                  key={msg.id || Date.now()}
                  className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    {msg.content || msg.message?.content}
                  </div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
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