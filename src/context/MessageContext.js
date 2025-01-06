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

  // 1. 首先定义 fetchConversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      const convs = await getUserConversations(user.id);
      setConversations(convs);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  }, [user]);

  // 2. 然后定义 loadChatMessages
  const loadChatMessages = useCallback(async (otherUserId) => {
    if (!user || !otherUserId) return [];
    
    try {
      setLoading(true);
      setCurrentChat(otherUserId);
      
      // 从 IndexedDB 加载消息
      const messages = await getUserMessages(user.id, otherUserId);
      
      // 合并内存中的消息
      const allMessages = [
        ...messages,
        ...currentMessages.filter(msg => 
          !messages.some(m => m.id === msg.id)
        )
      ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      setCurrentMessages(allMessages);
      await markMessagesAsRead(user.id, otherUserId);
      await fetchConversations();
      
      return allMessages;
    } catch (error) {
      console.error('Error loading chat messages:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, currentMessages]);

  // 3. WebSocket 相关的 useEffect
  useEffect(() => {
    if (user) {
      wsService.connect(user.id);
      
      const unsubscribe = wsService.onMessage(async (data) => {
        try {
          const message = data.type === 'chat' ? data.message : data;
          
          setAllMessages(prevMessages => {
            if (prevMessages.some(msg => msg.id === message.id)) {
              return prevMessages;
            }
            return [...prevMessages, message];
          });

          setCurrentMessages(prevMessages => {
            if (prevMessages.some(msg => msg.id === message.id)) {
              return prevMessages;
            }
            
            if (currentChat && 
                (message.senderId === currentChat || message.receiverId === currentChat)) {
              return [...prevMessages, message].sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
              );
            }
            
            return prevMessages;
          });

          await saveMessage(message.senderId, message.receiverId, message.content);
          await fetchConversations();
          
          if (message.senderId !== user.id && !currentChat) {
            await loadChatMessages(message.senderId);
          }
        } catch (error) {
          console.error('Error processing received message:', error);
        }
      });

      return () => {
        unsubscribe();
        wsService.disconnect();
      };
    }
  }, [user, currentChat, loadChatMessages, fetchConversations]);

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

  // 添加一个新的 useEffect 专门用于初始化
  useEffect(() => {
    const initializeData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // 1. 先加载所有会话
        await fetchConversations();
        
        // 2. 加载所有历史消息
        const convs = await getUserConversations(user.id);
        const allHistoricalMessages = [];
        
        for (const conv of convs) {
          const messages = await getUserMessages(user.id, conv.otherUserId);
          allHistoricalMessages.push(...messages);
        }
        
        // 去重并按时间排序
        const uniqueMessages = Array.from(
          new Map(allHistoricalMessages.map(msg => [msg.id, msg])).values()
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        setAllMessages(uniqueMessages);
        
        // 3. 如果有当前聊天，加载相关消息
        if (currentChat) {
          const currentMessages = uniqueMessages.filter(msg => 
            (msg.senderId === user.id && msg.receiverId === currentChat) ||
            (msg.senderId === currentChat && msg.receiverId === user.id)
          );
          setCurrentMessages(currentMessages);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user]); // 只在用户变化时执行

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