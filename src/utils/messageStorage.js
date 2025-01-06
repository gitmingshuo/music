import { getAllUsers as getStorageUsers, findUserById } from './userStorage';
import { 
  saveMessageToDB, 
  getConversationMessages, 
  getUserConversations as getDBConversations,
  updateConversation,
  listenToMessages,
  getDB,
  initDB
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

    // 保存消息到 IndexedDB
    await saveMessageToDB(message);

    // 更新会话信息
    await updateConversations(senderId, receiverId, content, message.timestamp);

    return message;
  } catch (error) {
    console.error('Error saving message:', error);
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
    // 直接从 IndexedDB 获取消息
    const messages = await getConversationMessages(userId1, userId2);
    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

// 修改 saveConversationsToDB 函数
export const saveConversationsToDB = async (conversations) => {
  try {
    const db = await getDB();
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    
    await Promise.all(
      conversations.map(async (conv) => {
        await db.put('conversations', conv);
      })
    );
  } catch (error) {
    console.error('Error saving conversations:', error);
  }
};

// 修改 getUserConversations 函数
export const getUserConversations = async (userId) => {
  try {
    const db = await getDB();
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    
    const conversations = await db.getAllFromIndex('conversations', 'userId', userId);
    
    // 获取每个会话对应的用户信息
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = await findUserById(conv.otherUserId);
        return {
          ...conv,
          user: otherUser,
          lastMessage: conv.lastMessage || '暂无消息'
        };
      })
    );

    console.log('Retrieved conversations:', conversationsWithUsers);
    return conversationsWithUsers;
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

// 修改搜索用户函数
export const searchUser = async (username) => {
  try {
    // 先从本地存储中查找
    const localUsers = getStorageUsers();
    const localUser = localUsers.find(
      user => user.username.toLowerCase() === username.toLowerCase()
    );
    
    if (localUser) {
      return localUser;
    }

    // 如果本地没有，尝试从服务器获取
    const response = await apiRequest(`${API_ENDPOINTS.SEARCH_USER}?username=${username}`);
    if (response.user) {
      // 将新用户添加到本地存储
      await addUserToStorage(response.user);
      return response.user;
    }
    
    return null;
  } catch (error) {
    console.error('Error searching user:', error);
    return null;
  }
};

// 添加新用户到本地存储
const addUserToStorage = async (user) => {
  try {
    const db = await getDB();
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    await db.put('users', user);
  } catch (error) {
    console.error('Error adding user to storage:', error);
  }
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