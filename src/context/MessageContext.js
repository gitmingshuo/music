import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserConversations, 
  saveMessage, 
  getUserMessages,
  markMessagesAsRead,
  searchUser,
  initMessageListener,
  handleReceivedMessage
} from '../utils/messageStorage';
import { wsService } from '../utils/websocket';
import { sendNotification } from '../utils/pushNotifications';

const MessageContext = createContext();

export function MessageProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // 监控 currentChat 变化
  useEffect(() => {
    console.log('Current chat changed to:', currentChat);
  }, [currentChat]);

  // 获取会话列表的函数
  const fetchConversations = async (force = false) => {
    if (!user) return;
    
    try {
      const userConversations = await getUserConversations(user.id);
      
      // 总是保持至少已存在的会话
      const existingConvs = new Map(conversations.map(conv => [conv.id, conv]));
      const newConvs = userConversations.map(conv => {
        const existing = existingConvs.get(conv.id);
        return existing ? { ...existing, ...conv } : conv;
      });

      // 更新会话列表
      if (force || JSON.stringify(conversations) !== JSON.stringify(newConvs)) {
        setConversations(newConvs);
      }
    } catch (error) {
      console.error('获取会话列表失败:', error);
    }
  };

  // 加载聊天消息
  const loadChatMessages = async (chatId) => {
    if (!user || !chatId) return;
    
    try {
      setLoading(true);
      
      // 获取消息记录
      const messages = await getUserMessages(user.id, chatId);
      setCurrentMessages(messages);
      
      // 标记消息为已读
      try {
        await fetch('/api/messages/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            chatId
          })
        });
      } catch (markError) {
        // 即使标记已读失败，也不影响消息显示
        console.warn('Error marking messages as read:', markError);
      }
      
      return messages;
    } catch (error) {
      console.error('Error loading messages:', error);
      // 即使加载失败，也保留现有消息
      return currentMessages;
    } finally {
      setLoading(false);
    }
  };

  // WebSocket 连接和消息处理
  useEffect(() => {
    if (!user) return;

    console.log('Initializing WebSocket for user:', user.id);
    wsService.connect(user.id);
    
    const unsubscribe = wsService.onMessage(async (data) => {
      try {
        const message = data.type === 'chat' ? data.message : data;
        console.log('Received message:', message);

        // 保存接收到的消息
        await handleReceivedMessage(message);

        // 如果是当前聊天窗口的消息，立即更新显示
        if (currentChat && 
            (message.senderId === currentChat || message.receiverId === currentChat)) {
          setCurrentMessages(prevMessages => {
            // 避免重复添加相同的消息
            if (prevMessages.some(msg => msg.id === message.id)) {
              return prevMessages;
            }
            return [...prevMessages, message].sort((a, b) => 
              new Date(a.timestamp) - new Date(b.timestamp)
            );
          });
        }

        // 更新会话列表
        await fetchConversations();
      } catch (error) {
        console.error('Error processing received message:', error);
      }
    });

    return () => {
      console.log('Cleaning up WebSocket connection');
      unsubscribe();
      wsService.disconnect();
    };
  }, [user, currentChat]); // 添加 currentChat 作为依赖

  // 定期刷新会话列表
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
      fetchConversations();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    if (user) {
      console.log('WebSocket connection status:', {
        userId: user.id,
        currentChat,
        isConnected: wsService.channel !== null,
        channelName: wsService.channel ? `chat-${user.id}` : null
      });
    }
  }, [user, currentChat]);

  const sendMessage = async (receiverId, content) => {
    if (!user || !receiverId || !content || loading) return false;
    
    try {
      setLoading(true);
      
      // 创建新消息对象
      const newMessage = {
        senderId: user.id,
        receiverId,
        content,
        timestamp: Date.now()
      };
      
      // 保存到本地存储
      try {
        const db = await openDB();
        await db.add('messages', newMessage);
      } catch (storageError) {
        console.warn('Error saving message locally:', storageError);
      }
      
      // 立即更新本地消息列表
      if (currentChat === receiverId) {
        setCurrentMessages(prev => [...prev, newMessage]);
      }
      
      const messageData = {
        type: 'chat',
        message: newMessage
      };

      // 发送到服务器
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        // 发送失败时从消息列表中移除
        if (currentChat === receiverId) {
          setCurrentMessages(prev => prev.filter(msg => msg.timestamp !== newMessage.timestamp));
        }
        throw new Error(error.error || 'Failed to send message');
      }

      const result = await response.json();
      
      // 发送成功后更新会话列表
      await fetchConversations();
      
      return result.success;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <MessageContext.Provider
      value={{
        conversations,
        currentChat,
        currentMessages,
        loading,
        setCurrentChat,
        sendMessage,
        searchUsers: searchUser,
        loadChatMessages,
        fetchConversations
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  return useContext(MessageContext);
} 