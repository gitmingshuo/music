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

  // 初始化 WebSocket 连接
  useEffect(() => {
    if (user) {
      wsService.connect(user.id);
      return () => wsService.disconnect();
    }
  }, [user]);

  // 实时更新消息和会话
  useEffect(() => {
    if (!user) return;

    const handleNewMessage = async (message) => {
      if (message.senderId === user.id || message.receiverId === user.id) {
        await fetchConversations();
        
        if (currentChat && 
           (message.senderId === currentChat || message.receiverId === currentChat)) {
          await loadChatMessages(currentChat);
        }
      }
    };

    const messageUnsubscribe = initMessageListener((message) => handleNewMessage(message));
    return () => messageUnsubscribe();
  }, [user, currentChat]);

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
    if (!user || !otherUserId) return [];
    
    try {
      setLoading(true);
      setCurrentChat(otherUserId);
      const messages = await getUserMessages(user.id, otherUserId);
      setCurrentMessages(messages);
      await markMessagesAsRead(user.id, otherUserId);
      await fetchConversations();
      return messages;
    } catch (error) {
      console.error('加载聊天消息失败:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (receiverId, content) => {
    if (!user || !receiverId || !content || loading) return false;
    
    try {
      setLoading(true);
      const newMessage = await saveMessage(user.id, receiverId, content);
      
      // 发送通知
      await sendNotification(
        receiverId,
        `新消息来自 ${user.username}`,
        content
      );
      
      if (currentChat === receiverId) {
        setCurrentMessages(prev => [...prev, newMessage]);
      }
      
      await fetchConversations();
      return true;
    } catch (error) {
      console.error('发送消息失败:', error);
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