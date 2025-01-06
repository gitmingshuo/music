import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserConversations, 
  saveMessage, 
  searchUser,
  getUserMessages,
  markMessagesAsRead,
  initMessageListener
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

  // 初始化 WebSocket 连接
  useEffect(() => {
    if (user) {
      console.log('Initializing WebSocket for user:', user.id);
      wsService.connect(user.id);
      
      const unsubscribe = wsService.onMessage(async (data) => {
        console.log('WebSocket message received in context:', data);
        
        try {
          const message = data.type === 'chat' ? data.message : data;
          console.log('Processing received message:', message);

          // 立即更新消息列表
          setCurrentMessages(prevMessages => {
            // 检查消息是否相关
            const isRelevantMessage = 
              currentChat && 
              ((message.senderId === currentChat && message.receiverId === user.id) ||
               (message.receiverId === currentChat && message.senderId === user.id));

            console.log('Message relevance check:', {
              isRelevantMessage,
              currentChat,
              senderId: message.senderId,
              receiverId: message.receiverId,
              userId: user.id
            });

            if (!isRelevantMessage) {
              return prevMessages;
            }

            // 检查消息是否已存在
            if (prevMessages.some(msg => msg.id === message.id)) {
              return prevMessages;
            }

            return [...prevMessages, message];
          });

          // 保存到本地存储
          await saveMessage(
            message.senderId,
            message.receiverId,
            message.content
          );

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
    }
  }, [user, currentChat]); // 添加 currentChat 作为依赖

  const fetchConversations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userConversations = await getUserConversations(user.id);
      setConversations(userConversations);
    } catch (error) {
      console.error('获取会话列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async (otherUserId) => {
    console.log('Loading chat messages for:', otherUserId);
    if (!user || !otherUserId) {
      console.log('Missing user or otherUserId:', { user, otherUserId });
      return [];
    }
    
    try {
      setLoading(true);
      // 使用 await 确保 currentChat 更新完成
      await new Promise(resolve => {
        setCurrentChat(otherUserId);
        resolve();
      });
      console.log('Set new currentChat:', otherUserId);
      
      // 获取历史消息
      const historicalMessages = await getUserMessages(user.id, otherUserId);
      console.log('Loaded historical messages:', historicalMessages);
      
      // 获取当前消息列表中与该聊天相关的新消息
      const relevantNewMessages = currentMessages.filter(msg => 
        (msg.senderId === user.id && msg.receiverId === otherUserId) ||
        (msg.senderId === otherUserId && msg.receiverId === user.id)
      );
      console.log('Relevant new messages:', relevantNewMessages);

      // 合并历史消息和新消息，并按时间排序
      const allMessages = [...historicalMessages, ...relevantNewMessages]
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // 去重
      const uniqueMessages = allMessages.filter((msg, index, self) =>
        index === self.findIndex(m => m.id === msg.id)
      );

      console.log('Final merged messages:', uniqueMessages);
      
      // 使用函数式更新确保最新状态
      setCurrentMessages(uniqueMessages);
      
      await markMessagesAsRead(user.id, otherUserId);
      await fetchConversations();
      return uniqueMessages;
    } catch (error) {
      console.error('Error loading chat messages:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (receiverId, content) => {
    console.log('MessageContext sendMessage:', { receiverId, content });
    if (!user || !receiverId || !content || loading) {
      console.log('Send message preconditions not met:', {
        hasUser: !!user,
        hasReceiverId: !!receiverId,
        hasContent: !!content,
        isLoading: loading
      });
      return false;
    }
    
    try {
      setLoading(true);
      
      // 创建消息对象
      const messageData = {
        type: 'chat',
        message: {
          id: Date.now().toString(),
          senderId: user.id,
          receiverId: receiverId,
          content: content,
          timestamp: new Date().toISOString()
        }
      };

      console.log('Sending message data:', messageData);

      // 先保存到本地并立即更新UI
      const savedMessage = await saveMessage(
        user.id,
        receiverId,
        content
      );
      console.log('Message saved locally:', savedMessage);

      // 立即更新当前消息列表
      setCurrentMessages(prevMessages => [...prevMessages, savedMessage]);

      // 发送到服务器
      await wsService.sendMessage(messageData);
      console.log('Message sent to server');

      // 更新会话列表
      await fetchConversations();
      return true;
    } catch (error) {
      console.error('Error in send message flow:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Current messages updated:', currentMessages);
  }, [currentMessages]);

  // 监控消息状态变化
  useEffect(() => {
    console.log('Current messages state:', {
      currentChat,
      messagesCount: currentMessages.length,
      messages: currentMessages
    });
  }, [currentMessages, currentChat]);

  // 监控 WebSocket 连接状态
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

  // 监控消息列表变化
  useEffect(() => {
    console.log('Messages state updated:', {
      currentChat,
      messagesCount: currentMessages.length,
      messages: currentMessages
    });
  }, [currentMessages, currentChat]);

  // 监控发送状态
  useEffect(() => {
    console.log('Loading state changed:', loading);
  }, [loading]);

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