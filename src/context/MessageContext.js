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

const MessageContext = createContext();

export function MessageProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const { user } = useAuth();

  // 实时更新消息和会话
  useEffect(() => {
    if (!user) return;

    // 初始化消息监听器
    const handleNewMessage = (message) => {
      // 如果消息与当前用户相关
      if (message.senderId === user.id || message.receiverId === user.id) {
        // 更新会话列表
        fetchConversations();
        
        // 如果是当前聊天，更新消息列表
        if (currentChat && 
           (message.senderId === currentChat || message.receiverId === currentChat)) {
          loadChatMessages(currentChat);
        }
      }
    };

    // 添加消息监听器
    initMessageListener((message) => handleNewMessage(message.detail.message));

    // 定期刷新会话列表
    const interval = setInterval(() => {
      fetchConversations();
      if (currentChat) {
        loadChatMessages(currentChat);
      }
    }, 1000); // 每秒更新一次

    return () => {
      clearInterval(interval);
    };
  }, [user, currentChat]);

  const fetchConversations = () => {
    if (user) {
      const userConversations = getUserConversations(user.id);
      setConversations(userConversations);
    }
  };

  const loadChatMessages = (otherUserId) => {
    if (!user || !otherUserId) return [];
    
    setCurrentChat(otherUserId);
    const messages = getUserMessages(user.id, otherUserId);
    setCurrentMessages(messages);
    markMessagesAsRead(user.id, otherUserId);
    fetchConversations();
    return messages;
  };

  const sendMessage = async (receiverId, content) => {
    if (!user || !receiverId || !content) return false;
    
    try {
      const newMessage = saveMessage(user.id, receiverId, content);
      
      // 立即更新当前消息列表
      if (currentChat === receiverId) {
        setCurrentMessages(prev => [...prev, newMessage]);
      }
      
      // 立即更新会话列表
      fetchConversations();
      
      return true;
    } catch (error) {
      console.error('发送消息失败:', error);
      return false;
    }
  };

  const searchUsers = async (username) => {
    return searchUser(username);
  };

  return (
    <MessageContext.Provider
      value={{
        conversations,
        currentChat,
        currentMessages,
        setCurrentChat,
        sendMessage,
        searchUsers,
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