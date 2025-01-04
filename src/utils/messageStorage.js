import { getAllUsers as getStorageUsers, findUserById } from './userStorage';
import { 
  saveMessageToDB, 
  getConversationMessages, 
  getUserConversations as getDBConversations,
  updateConversation,
  listenToMessages
} from './db';
import { wsService } from './websocket';

// 保存新消息
export const saveMessage = async (senderId, receiverId, content) => {
  const timestamp = new Date().toISOString();
  const messageId = Date.now().toString();
  
  const newMessage = {
    id: messageId,
    senderId,
    receiverId,
    content,
    timestamp,
    read: false
  };

  // 发送消息到 WebSocket 服务器
  wsService.sendMessage({
    type: 'chat',
    message: newMessage
  });

  // 本地存储
  await saveMessageToDB(newMessage);
  await updateConversations(senderId, receiverId, content, timestamp);
  
  return newMessage;
};

// 更新会话信息
const updateConversations = async (senderId, receiverId, lastMessage, timestamp) => {
  // 更新发送者的会话
  await updateConversation({
    id: `${senderId}-${receiverId}`,
    userId: senderId,
    otherUserId: receiverId,
    lastMessage,
    timestamp,
    unreadCount: 0
  });

  // 更新接收者的会话
  await updateConversation({
    id: `${receiverId}-${senderId}`,
    userId: receiverId,
    otherUserId: senderId,
    lastMessage,
    timestamp,
    unreadCount: 1
  });
};

// 获取用户消息
export const getUserMessages = async (userId1, userId2) => {
  return await getConversationMessages(userId1, userId2);
};

// 获取用户的所有会话
export const getUserConversations = async (userId) => {
  const conversations = await getDBConversations(userId);
  return conversations.map(conv => ({
    ...conv,
    user: findUserById(conv.otherUserId)
  }));
};

// 搜索用户
export const searchUser = (username) => {
  const users = getStorageUsers();
  return users.find(user => user.username.toLowerCase() === username.toLowerCase());
};

// 标记消息为已读
export const markMessagesAsRead = async (userId, otherUserId) => {
  const conversation = {
    id: `${userId}-${otherUserId}`,
    userId,
    otherUserId,
    unreadCount: 0
  };
  await updateConversation(conversation);
};

// 初始化消息监听器
export const initMessageListener = (callback) => {
  // 使用 WebSocket 监听消息
  return wsService.onMessage((data) => {
    if (data.type === 'chat') {
      callback(data.message);
    }
  });
}; 