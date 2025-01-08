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
import { saveMessageToDB, updateConversation } from '../utils/db';
import { wsService } from '../utils/websocket';
import { sendNotification } from '../utils/pushNotifications';
import { openDB } from '../utils/db';

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
      setCurrentChat(chatId);
      
      // 获取消息记录
      const messages = await getUserMessages(user.id, chatId);
      console.log('Loaded messages:', messages);
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
        await fetchConversations(true);
      } catch (markError) {
        console.warn('Error marking messages as read:', markError);
      }
      
      return messages;
    } catch (error) {
      console.error('Error loading messages:', error);
      return currentMessages;
    } finally {
      setLoading(false);
    }
  };

  // 添加消息监听器
  useEffect(() => {
    if (user && currentChat) {
      const loadInitialMessages = async () => {
        await loadChatMessages(currentChat);
      };
      loadInitialMessages();
    }
  }, [user, currentChat]);

  // WebSocket 连接和消息处理
  useEffect(() => {
    if (!user) return;

    console.log('Initializing WebSocket for user:', user.id);
    wsService.connect(user.id);
    
    const unsubscribe = wsService.onMessage(async (data) => {
      try {
        const message = data.type === 'chat' ? data.message : data;
        console.log('Received message:', message);

        // 检查是否是自己发送的消息
        const isSelfMessage = message.senderId === user.id;
        console.log('Is self message:', isSelfMessage);

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
            console.log('Adding message to chat:', message);
            return [...prevMessages, message].sort((a, b) => 
              new Date(a.timestamp) - new Date(b.timestamp)
            );
          });
        }

        // 更新会话列表
        await fetchConversations(true);
      } catch (error) {
        console.error('Error processing received message:', error);
      }
    });

    return () => {
      console.log('Cleaning up WebSocket connection');
      unsubscribe();
      wsService.disconnect();
    };
  }, [user, currentChat]);

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
      
      // 生成唯一的消息ID
      const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // 创建新消息对象。。
      const newMessage = {
        id: messageId,
        senderId: user.id,
        receiverId,
        content,
        timestamp: new Date().toISOString(),
        conversationId: [user.id, receiverId].sort().join('-')
      };

      // 立即更新UI
      setCurrentMessages(prev => [...prev, newMessage]);
      
      // 保存到本地存储
      try {
        await saveMessageToDB(newMessage);
        console.log('Message saved to local DB:', newMessage);
        
        // 立即更新会话列表
        const conversation = {
          id: newMessage.conversationId,
          userId: user.id,
          otherUserId: receiverId,
          lastMessage: content,
          timestamp: newMessage.timestamp,
          unreadCount: 0
        };
        await updateConversation(conversation);
      } catch (storageError) {
        console.error('Error saving message locally:', storageError);
      }
      
      const messageData = {
        type: 'chat',
        message: newMessage
      };

      // 使用完整的URL
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/send-message'
        : '/api/send-message';

      // 发送到服务器
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        console.error('Server response:', errorData);
        throw new Error(errorData.error || 'Failed to send message');
      }

      const result = await response.json();
      console.log('Message sent successfully:', result);
      
      // 更新会话列表
      await fetchConversations(true);
      
      return true;
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