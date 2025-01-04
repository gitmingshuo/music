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
      wsService.connect(user.id);
      return () => wsService.disconnect();
    }
  }, [user]);

  // 实时更新消息和会话
  useEffect(() => {
    if (!user) return;

    const handleNewMessage = async (message) => {
      console.log('Received new message:', message);
      
      try {
        console.log('Saving message to local DB...');
        const savedMessage = await saveMessage(
          message.senderId,
          message.receiverId,
          message.content
        );
        console.log('Message saved:', savedMessage);

        // 使用函数式更新确保获取最新的 currentChat 值
        setCurrentMessages(prevMessages => {
          const isRelevantMessage = currentChat && 
            (message.senderId === currentChat || message.receiverId === currentChat);
          
          console.log('Message relevance check:', {
            currentChat,
            senderId: message.senderId,
            receiverId: message.receiverId,
            isRelevant: isRelevantMessage
          });

          if (!isRelevantMessage) {
            console.log('Message not relevant to current chat');
            return prevMessages;
          }

          const messageExists = prevMessages.some(msg => msg.id === savedMessage.id);
          if (messageExists) {
            console.log('Message already exists in current chat');
            return prevMessages;
          }

          console.log('Adding new message to chat');
          return [...prevMessages, savedMessage];
        });

        await fetchConversations();
      } catch (error) {
        console.error('Error handling new message:', error);
      }
    };

    const unsubscribe = initMessageListener(handleNewMessage);
    fetchConversations();

    return () => unsubscribe();
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
      
      const messages = await getUserMessages(user.id, otherUserId);
      console.log('Loaded messages:', messages);
      
      // 使用函数式更新确保最新状态
      setCurrentMessages(prevMessages => {
        console.log('Updating messages:', { prevMessages, newMessages: messages });
        return messages;
      });
      
      await markMessagesAsRead(user.id, otherUserId);
      await fetchConversations();
      return messages;
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

      // 先保存到本地
      const savedMessage = await saveMessage(
        user.id,
        receiverId,
        content
      );
      console.log('Message saved locally:', savedMessage);

      // 发送到服务器
      await wsService.sendMessage(messageData);
      console.log('Message sent to server');

      // 更新当前聊天消息列表
      if (currentChat === receiverId) {
        setCurrentMessages(prevMessages => [...prevMessages, savedMessage]);
      }

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