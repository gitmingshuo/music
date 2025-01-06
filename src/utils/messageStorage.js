import { getAllUsers as getStorageUsers, findUserById } from './userStorage';
import { 
  saveMessageToDB, 
  getConversationMessages, 
  getUserConversations as getDBConversations,
  updateConversation,
  listenToMessages,
  getDB
} from './db';
import { wsService } from './websocket';
import { apiRequest, API_ENDPOINTS } from '../config/api';

// 添加消息格式验证函数
export const validateMessage = (message) => {
  const requiredFields = ['id', 'senderId', 'receiverId', 'content', 'timestamp'];
  const missingFields = requiredFields.filter(field => !message[field]);
  
  if (missingFields.length > 0) {
    console.error('Invalid message format - Missing fields:', missingFields);
    return false;
  }
  
  return true;
};

// 修改保存消息函数
export const saveMessage = async (senderId, receiverId, content) => {
  try {
    const message = {
      id: Date.now().toString(),
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString()
    };

    console.log('Saving new message:', message);
    
    // 验证消息格式
    if (!validateMessage(message)) {
      throw new Error('Invalid message format');
    }

    // 保存到 IndexedDB
    const db = await getDB();
    if (!db) {
      throw new Error('Failed to connect to database');
    }

    await db.add('messages', message);
    console.log('Message saved to IndexedDB:', message);
    
    // 更新会话信息
    await updateConversations(senderId, receiverId, content, message.timestamp);
    
    return message;
  } catch (error) {
    console.error('Error in saveMessage:', error);
    throw error;
  }
};

// 更新会话信息
const updateConversations = async (senderId, receiverId, content, timestamp) => {
  try {
    // 更新发送者的会话
    await updateConversation({
      id: `${senderId}-${receiverId}`,
      userId: senderId,
      otherUserId: receiverId,
      lastMessage: content, // 使用消息内容作为最后一条消息
      timestamp,
      unreadCount: 0
    });

    // 更新接收者的会话
    await updateConversation({
      id: `${receiverId}-${senderId}`,
      userId: receiverId,
      otherUserId: senderId,
      lastMessage: content, // 使用消息内容作为最后一条消息
      timestamp,
      unreadCount: 1
    });

    console.log('Conversations updated with last message:', {
      content,
      timestamp,
      senderId,
      receiverId
    });
  } catch (error) {
    console.error('Error updating conversations:', error);
  }
};

// 获取用户消息
export const getUserMessages = async (userId1, userId2) => {
  try {
    const messages = await getConversationMessages(userId1, userId2);
    console.log('Retrieved messages from storage:', messages);
    
    // 确保消息按时间排序
    const sortedMessages = messages.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    return sortedMessages;
  } catch (error) {
    console.error('Error getting user messages:', error);
    return [];
  }
};

// 获取用户的所有会话
export const getUserConversations = async (userId) => {
  try {
    const conversations = await getDBConversations(userId);
    const conversationsWithUsers = conversations.map(conv => ({
      ...conv,
      user: findUserById(conv.otherUserId),
      lastMessage: conv.lastMessage || '暂无消息' // 确保有默认值
    }));

    console.log('Retrieved conversations:', conversationsWithUsers);
    return conversationsWithUsers;
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

// 搜索用户
export const searchUser = (username) => {
  const users = getStorageUsers();
  return users.find(user => user.username.toLowerCase() === username.toLowerCase());
};

// 标记消息为已读
export const markMessagesAsRead = async (userId, otherUserId) => {
  try {
    await apiRequest(`${API_ENDPOINTS.MARK_READ}`, {
      method: 'POST',
      body: JSON.stringify({ userId, otherUserId })
    });
    
    // 更新本地存储
    const conversation = {
      id: `${userId}-${otherUserId}`,
      userId,
      otherUserId,
      unreadCount: 0
    };
    await updateConversation(conversation);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

// 初始化消息监听器
export const initMessageListener = (callback) => {
  return wsService.onMessage((data) => {
    if (data.type === 'chat') {
      callback(data.message);
    }
  });
}; 