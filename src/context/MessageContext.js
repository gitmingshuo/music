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
      console.log('Handling new message:', message);
      
      // 确保消息对象只包含需要的属性
      const processedMessage = {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        timestamp: message.timestamp
      };

      try {
        // 保存消息到本地数据库
        const savedMessage = await saveMessage(
          processedMessage.senderId, 
          processedMessage.receiverId, 
          processedMessage.content
        );

        // 检查是否是当前聊天的消息
        const isCurrentChat = currentChat && 
          (processedMessage.senderId === currentChat || processedMessage.receiverId === currentChat);

        if (isCurrentChat) {
          // 使用函数式更新确保状态正确更新
          setCurrentMessages(prevMessages => {
            // 检查消息是否已存在
            const messageExists = prevMessages.some(msg => msg.id === savedMessage.id);
            if (messageExists) {
              return prevMessages;
            }
            return [...prevMessages, savedMessage];
          });
        }

        // 更新会话列表
        await fetchConversations();

        // 如果不是当前用户发送的消息，发送通知
        if (processedMessage.senderId !== user.id) {
          await sendNotification(
            user.id,
            '新消息',
            processedMessage.content
          );
        }
      } catch (error) {
        console.error('Error handling message:', error);
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
    if (!user || !otherUserId) return [];
    
    try {
      setLoading(true);
      setCurrentChat(otherUserId);
      const messages = await getUserMessages(user.id, otherUserId);
      console.log('Loaded messages:', messages);
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

      // 发送消息
      await wsService.sendMessage(messageData);
      
      // 保存到本地并获取保存的消息对象
      const savedMessage = await saveMessage(
        user.id, 
        receiverId, 
        content
      );
      
      // 立即更新当前聊天消息列表
      if (currentChat === receiverId) {
        setCurrentMessages(prevMessages => [...prevMessages, savedMessage]);
      }
      
      // 更新会话列表
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