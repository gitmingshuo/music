import { 
  saveMessageToDB, 
  getConversationMessages, 
  getDBConversations,
  updateConversation as dbUpdateConversation,
  openDB
} from './db';
import { wsService } from './websocket';
import { apiRequest, API_ENDPOINTS } from '../config/api';
import { getAllUsers, findUserById } from './userStorage';

// 保存消息
export const saveMessage = async (senderId, receiverId, content) => {
  try {
    const message = {
      id: Date.now().toString(),
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      conversationId: [senderId, receiverId].sort().join('-')
    };

    // 保存消息到 IndexedDB
    const savedMessage = await saveMessageToDB(message);
    
    // 更新发送者的会话
    const senderConversation = {
      id: message.conversationId,
      userId: senderId,
      otherUserId: receiverId,
      lastMessage: content,
      timestamp: message.timestamp,
      unreadCount: 0
    };

    await dbUpdateConversation(senderConversation);
    console.log('Sender conversation updated:', senderConversation);

    return savedMessage;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// 获取用户消息
export const getUserMessages = async (userId1, userId2) => {
  try {
    console.log('Getting messages for users:', userId1, userId2);
    const messages = await getConversationMessages(userId1, userId2);
    console.log('Retrieved messages:', messages);
    return messages;
  } catch (error) {
    console.error('Error getting user messages:', error);
    return [];
  }
};

// 获取用户的所有会话
export const getUserConversations = async (userId) => {
  try {
    const conversations = await getDBConversations(userId);
    console.log('Raw conversations from DB:', conversations);
    
    // 使用 Map 来确保每个对话只出现一次
    const conversationMap = new Map();
    
    conversations.forEach(conv => {
      // 确定对话的另一方用户ID
      const otherUserId = conv.userId === userId ? conv.otherUserId : conv.userId;
      const user = findUserById(otherUserId);
      
      if (!user) {
        console.error('User not found:', otherUserId);
        return;
      }

      const existingConv = conversationMap.get(otherUserId);
      if (!existingConv || new Date(conv.timestamp) > new Date(existingConv.timestamp)) {
        conversationMap.set(otherUserId, {
          id: conv.id,
          userId: userId,
          otherUserId: otherUserId,
          user,
          lastMessage: conv.lastMessage || '暂无消息',
          timestamp: conv.timestamp,
          unreadCount: conv.unreadCount || 0
        });
      }
    });

    const sortedConversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    console.log('Processed conversations:', sortedConversations);
    return sortedConversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

// 接收消息时的处理函数
export const handleReceivedMessage = async (message) => {
  try {
    // 保存消息到 IndexedDB
    const savedMessage = await saveMessageToDB(message);
    
    // 更新接收者的会话
    const conversationId = [message.senderId, message.receiverId].sort().join('-');
    const conversation = {
      id: conversationId,
      userId: message.receiverId,    // 使用接收者的ID
      otherUserId: message.senderId, // 使用发送者的ID
      lastMessage: message.content,
      timestamp: message.timestamp,
      unreadCount: 1                 // 接收的新消息未读
    };

    await dbUpdateConversation(conversation);
    return savedMessage;
  } catch (error) {
    console.error('Error handling received message:', error);
    throw error;
  }
};

// 标记消息为已读
export const markMessagesAsRead = async (userId, otherUserId) => {
  try {
    const conversationId = [userId, otherUserId].sort().join('-');
    
    // 更新本地会话的未读计数
    const conversation = {
      id: conversationId,
      userId: userId,
      otherUserId: otherUserId,
      unreadCount: 0,
      timestamp: new Date().toISOString()  // 保持时间戳
    };

    // 先更新本地数据库
    await dbUpdateConversation(conversation);
    console.log('Updated local conversation unread count:', conversation);

    // 调用服务器 API 更新未读状态
    const result = await apiRequest(API_ENDPOINTS.MARK_READ, {
      method: 'POST',
      body: JSON.stringify({ userId, otherUserId })
    });

    if (!result.success) {
      throw new Error('Failed to mark messages as read on server');
    }

    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// 搜索用户功能
export const searchUser = async (username) => {
  try {
    const users = getAllUsers();
    const foundUser = users.find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    );
    
    if (!foundUser) {
      throw new Error('用户未找到');
    }
    
    return foundUser;
  } catch (error) {
    console.error('搜索用户失败:', error);
    throw error;
  }
};

export const getMessages = async (userId, chatId) => {
  try {
    // 从 IndexedDB 获取消息
    const db = await openDB();
    const messages = await db.getAll('messages');
    
    // 过滤出相关的消息
    return messages.filter(msg => 
      (msg.senderId === userId && msg.receiverId === chatId) ||
      (msg.senderId === chatId && msg.receiverId === userId)
    ).sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};
