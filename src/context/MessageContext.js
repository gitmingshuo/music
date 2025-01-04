import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserConversations, 
  saveMessage, 
  searchUser,
  getUserMessages,
  markMessagesAsRead
} from '../utils/messageStorage';

const MessageContext = createContext();

export function MessageProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const { user } = useAuth();

  const fetchConversations = async () => {
    if (user) {
      const userConversations = getUserConversations(user.id);
      setConversations(userConversations);
    }
  };

  const sendMessage = async (receiverId, content) => {
    try {
      const newMessage = saveMessage(user.id, receiverId, content);
      await fetchConversations();
      return true;
    } catch (error) {
      console.error('发送消息失败:', error);
      return false;
    }
  };

  const searchUsers = async (username) => {
    const foundUser = searchUser(username);
    return foundUser;
  };

  const loadChatMessages = (otherUserId) => {
    const messages = getUserMessages(user.id, otherUserId);
    markMessagesAsRead(user.id, otherUserId);
    fetchConversations(); // 更新未读消息计数
    return messages;
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
      // 设置定时刷新
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <MessageContext.Provider
      value={{
        conversations,
        currentChat,
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