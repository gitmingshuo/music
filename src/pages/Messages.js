import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessage } from '../context/MessageContext';
import { isFollowing, followUser, unfollowUser } from '../utils/userStorage';
import './Messages.css';
import { useNavigate } from 'react-router-dom';
import EmojiPicker from '../components/EmojiPicker';
import { updateConversation as dbUpdateConversation } from '../utils/db';

// 移动端消息组件 - 实现类似微信的双层消息界面
// 包含会话列表页和聊天详情页，通过滑动切换视图
function Messages() {
  // ===== 状态管理 =====
  // 用户相关状态
  const [selectedUser, setSelectedUser] = useState(null); // 当前选中的聊天对象
  const [message, setMessage] = useState(''); // 当前输入框的消息内容
  const [inputMessage, setInputMessage] = useState(''); // 临时存储的消息内容
  const [searchInput, setSearchInput] = useState(''); // 搜索用户的输入内容
  
  // UI 状态控制
  const [showNewMessage, setShowNewMessage] = useState(false); // 控制新建消息对话框的显示
  const [searchError, setSearchError] = useState(''); // 搜索用户时的错误信息
  const [isFollowed, setIsFollowed] = useState(false); // 当前选中用户的关注状态
  const [sending, setSending] = useState(false); // 消息发送状态，防止重复发送
  const [loading, setLoading] = useState(false); // 加载状态，用于显示加载指示器
  const [messages, setMessages] = useState([]); // 当前会话的消息列表
  
  // 移动端视图控制
  const [showChat, setShowChat] = useState(false); // 控制聊天详情页的显示/隐藏，用于实现滑动切换效果

  // ===== Hooks 和 Context =====
  const { user } = useAuth(); // 当前登录用户信息
  const { 
    conversations, // 所有会话列表
    sendMessage, // 发送消息方法
    fetchConversations, // 获取会话列表方法
    searchUsers, // 搜索用户方法
    loadChatMessages, // 加载特定会话消息方法
    currentMessages, // 当前会话的消息
    currentChat, // 当前会话信息
    updateConversation, // 更新会话方法
  } = useMessage();
  const navigate = useNavigate();

  // ===== DOM 引用和滚动控制 =====
  const messagesEndRef = useRef(null); // 用于自动滚动到最新消息
  const messagesListRef = useRef(null); // 消息列表容器的引用
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true); // 是否应该自动滚动到底部

  // 检查消息列表是否接近底部，用于智能控制自动滚动
  const isNearBottom = () => {
    const container = messagesListRef.current;
    if (!container) return false;
    const threshold = 150; // 距离底部的阈值，小于这个值就认为"接近底部"
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };

  // 处理滚动事件
  const handleScroll = () => {
    setShouldAutoScroll(isNearBottom());
  };

  // 滚动到底部
  const scrollToBottom = () => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // ===== 滚动行为控制 =====
  useEffect(() => {
    // 添加滚动监听器，用于控制是否自动滚动
    const messagesList = messagesListRef.current;
    if (messagesList) {
      messagesList.addEventListener('scroll', handleScroll);
      return () => messagesList.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // 监听消息更新，自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, shouldAutoScroll]);

  // 监听新消息，如果是自己发送的则自动滚动到底部
  useEffect(() => {
    if (currentMessages?.length > 0) {
      console.log('Messages updated:', {
        count: currentMessages.length,
        messages: currentMessages
      });
      // 只有当新消息是自己发送的才自动滚动
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

  // 监听用户关注状态
  useEffect(() => {
    if (selectedUser) {
      setIsFollowed(isFollowing(user.id, selectedUser.id));
    }
  }, [selectedUser, user.id]);

  // ===== 消息列表初始化 =====
  // 调整消息列表滚动位置
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

  // 初始化加载会话列表
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

  // ===== 消息处理 =====
  // 发送消息的处理函数
  const handleSendMessage = async (content) => {
    if (!content.trim() || sending) return; // 防止发送空消息或重复发送
    
    try {
      setSending(true);
      const success = await sendMessage(currentChat, content);
      
      if (success) {
        setMessage(''); // 清空输入框
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('发送消息失败，请重试');
    } finally {
      setSending(false);
    }
  };

  // ===== 消息输入处理 =====
  // 处理回车发送消息
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !sending) {
      e.preventDefault();
      handleSendMessage(message);
    }
  };

  // ===== 新建会话处理 =====
  // 处理新建消息对话
  const handleNewMessage = async () => {
    // 输入验证
    if (!searchInput.trim() || !user) {
      setSearchError('请输入用户名');
      return;
    }
    
    try {
      setLoading(true);
      const foundUser = await searchUsers(searchInput);
      
      // 用户验证
      if (!foundUser) {
        setSearchError('未找到该用户');
        return;
      }

      if (foundUser.id === user.id) {
        setSearchError('不能给自己发送消息');
        return;
      }

      // 创建或获取会话
      const conversationId = [user.id, foundUser.id].sort().join('-');
      const existingConv = conversations?.find(conv => conv.id === conversationId);

      // 如果会话不存在则创建新会话
      if (!existingConv) {
        const newConv = {
          id: conversationId,
          userId: user.id,
          otherUserId: foundUser.id,
          user: foundUser,
          lastMessage: '',
          timestamp: new Date().toISOString(),
          unreadCount: 0
        };
        
        await dbUpdateConversation(newConv);
        await fetchConversations();
      }

      // 重置状态并加载消息
      setSelectedUser(foundUser);
      setSearchInput('');
      setSearchError('');
      await loadChatMessages(foundUser.id);
    } catch (error) {
      console.error('创建会话失败:', error);
      setSearchError('创建会话失败，请稍后重试');
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

  // ===== 移动端视图切换处理 =====
  // 处理选择会话，切换到聊天详情页
  const handleSelectConversation = async (conv) => {
    setSelectedUser(conv.user);
    loadChatMessages(conv.user.id);
    
    // 在移动端时才切换显示状态
    if (window.innerWidth <= 768) {
      setShowChat(true);
      document.querySelector('.messages-container').classList.add('show-chat');
    }
  };

  // 处理返回按钮点击，返回会话列表页
  const handleBack = () => {
    setShowChat(false);
    document.querySelector('.messages-container').classList.remove('show-chat');
  };

  // ===== 用户关系处理 =====
  // 处理关注/取消关注用户
  const handleFollow = () => {
    if (!selectedUser || !user) return;
    
    if (isFollowed) {
      unfollowUser(user.id, selectedUser.id);
    } else {
      followUser(user.id, selectedUser.id);
    }
    setIsFollowed(!isFollowed);
  };

  // ===== 表情处理 =====
  // 处理表情选择
  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
  };

  // JSX 渲染
  return (
    <div className="messages-container">
      {/* 左侧会话列表 - 桌面端始终显示 */}
      <div className="conversations-list">
        <div className="conversations-header">
          <h2>消息</h2>
          <button className="new-message-btn" onClick={() => setShowNewMessage(true)}>
            新建消息
          </button>
        </div>
        
        {showNewMessage && (
          <div className="new-message-form">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="输入用户名..."
            />
            <button onClick={handleNewMessage}>查找</button>
            {searchError && (
              <div className="search-error">{searchError}</div>
            )}
          </div>
        )}

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

      {/* 右侧聊天区域 - 桌面端 */}
      <div className="chat-area">
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
                onKeyPress={handleKeyPress}
                disabled={sending}
              />
              <button 
                onClick={() => handleSendMessage(message)}
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