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
  const [currentMessages, setCurrentMessages] = useState([]);
  const { user } = useAuth();

  const updateCurrentChat = (chatUserId) => {
    if (user && chatUserId) {
      const messages = getUserMessages(user.id, chatUserId);
      setCurrentMessages(messages || []);
      setCurrentChat(chatUserId);
    }
  };

  const fetchConversations = async () => {
    if (user) {
      const userConversations = getUserConversations(user.id);
      setConversations(userConversations);
      
      if (currentChat) {
        const messages = getUserMessages(user.id, currentChat);
        setCurrentMessages(messages || []);
      }
    }
  };

  const sendMessage = async (receiverId, content) => {
    if (!user || !receiverId || !content) return false;
    
    try {
      const newMessage = saveMessage(user.id, receiverId, content);
      
      if (receiverId === currentChat) {
        setCurrentMessages(prev => [...prev, newMessage]);
      }
      
      const updatedConversations = await getUserConversations(user.id);
      setConversations(updatedConversations);
      
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
    if (!user || !otherUserId) return [];
    
    setCurrentChat(otherUserId);
    const messages = getUserMessages(user.id, otherUserId);
    setCurrentMessages(messages || []);
    markMessagesAsRead(user.id, otherUserId);
    fetchConversations();
    return messages || [];
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
      
      const interval = setInterval(() => {
        fetchConversations();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleNewMessage = (event) => {
      const newMessage = event.detail.message;
      
      if (currentChat && 
         (newMessage.senderId === currentChat || newMessage.receiverId === currentChat)) {
        setCurrentMessages(prev => [...prev, newMessage]);
      }
      
      fetchConversations();
    };

    window.addEventListener('newMessage', handleNewMessage);
    return () => window.removeEventListener('newMessage', handleNewMessage);
  }, [currentChat, user]);

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