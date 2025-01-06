import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserConversations, 
  saveMessage, 
  searchUser,
  getUserMessages,
  markMessagesAsRead,
  initMessageListener,
  saveConversationsToDB
} from '../utils/messageStorage';
import { wsService } from '../utils/websocket';
import { sendNotification } from '../utils/pushNotifications';

const MessageContext = createContext();

export function MessageProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
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

          // 更新所有消息列表
          setAllMessages(prevMessages => {
            if (prevMessages.some(msg => msg.id === message.id)) {
              return prevMessages;
            }
            return [...prevMessages, message];
          });

          // 如果是当前聊天的消息，也更新当前消息列表
          if (currentChat && 
              (message.senderId === currentChat || message.receiverId === currentChat)) {
            setCurrentMessages(prevMessages => {
              if (prevMessages.some(msg => msg.id === message.id)) {
                return prevMessages;
              }
              return [...prevMessages, message].sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
              );
            });
          }

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
  }, [user, currentChat]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      const convs = await getUserConversations(user.id);
      setConversations(convs);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  }, [user]);

  const loadChatMessages = async (otherUserId) => {
    console.log('Loading chat messages for:', otherUserId);
    if (!user || !otherUserId) {
      console.log('Missing user or otherUserId:', { user, otherUserId });
      return [];
    }
    
    try {
      setLoading(true);
      setCurrentChat(otherUserId);
      
      // 获取历史消息
      const historicalMessages = await getUserMessages(user.id, otherUserId);
      console.log('Loaded historical messages:', historicalMessages);
      
      // 从所有消息中筛选出相关消息
      const relevantMessages = allMessages.filter(msg => 
        (msg.senderId === user.id && msg.receiverId === otherUserId) ||
        (msg.senderId === otherUserId && msg.receiverId === user.id)
      );
      console.log('Relevant messages from memory:', relevantMessages);

      // 合并消息并去重
      const mergedMessages = [...historicalMessages, ...relevantMessages];
      const uniqueMessages = Array.from(new Map(
        mergedMessages.map(msg => [msg.id, msg])
      ).values());

      // 按时间排序
      const sortedMessages = uniqueMessages.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      console.log('Final sorted messages:', sortedMessages);
      setCurrentMessages(sortedMessages);
      
      await markMessagesAsRead(user.id, otherUserId);
      await fetchConversations();
      return sortedMessages;
    } catch (error) {
      console.error('Error loading chat messages:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (receiverId, content) => {
    console.log('MessageContext sendMessage:', { receiverId, content });
    if (!user || !receiverId || !content || loading) return false;
    
    try {
      setLoading(true);
      
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

      // 保存到本地
      const savedMessage = await saveMessage(
        user.id,
        receiverId,
        content
      );

      // 更新所有消息列表
      setAllMessages(prev => [...prev, savedMessage]);

      // 如果是当前聊天，更新当前消息列表
      if (currentChat === receiverId) {
        setCurrentMessages(prev => [...prev, savedMessage].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        ));
      }

      // 发送到服务器
      await wsService.sendMessage(messageData);
      await fetchConversations();
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
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

  const updateConversation = async (conversation) => {
    try {
      await saveConversationsToDB([conversation]);
      await fetchConversations();
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
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
        fetchConversations,
        updateConversation
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  return useContext(MessageContext);
} 