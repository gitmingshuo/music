import { getAllUsers as getStorageUsers, findUserById } from './userStorage';

const MESSAGES_KEY = 'chat_messages';

// 获取所有用户
export const getAllUsers = () => {
  return getStorageUsers();
};

// 搜索用户
export const searchUser = (username) => {
  const users = getAllUsers();
  return users.find(user => user.username.toLowerCase() === username.toLowerCase());
};

// 获取用户消息
export const getUserMessages = (userId1, userId2) => {
  if (!userId1 || !userId2) return [];
  
  const messages = localStorage.getItem(MESSAGES_KEY);
  const allMessages = messages ? JSON.parse(messages) : [];
  const userMessages = allMessages.filter(msg => 
    msg && msg.senderId && msg.receiverId && (
      (msg.senderId === userId1 && msg.receiverId === userId2) ||
      (msg.senderId === userId2 && msg.receiverId === userId1)
    )
  );
  return userMessages;
};

// 保存新消息
export const saveMessage = (senderId, receiverId, content) => {
  if (!senderId || !receiverId || !content) {
    throw new Error('Invalid message data');
  }
  
  const messages = localStorage.getItem(MESSAGES_KEY);
  const allMessages = messages ? JSON.parse(messages) : [];
  
  const newMessage = {
    id: Date.now().toString(),
    senderId,
    receiverId,
    content,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  allMessages.push(newMessage);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));
  
  // 触发一个自定义事件，通知其他标签页有新消息
  window.dispatchEvent(new CustomEvent('newMessage', { 
    detail: { message: newMessage } 
  }));
  
  return newMessage;
};

// 添加消息监听器
export const initMessageListener = (callback) => {
  window.addEventListener('newMessage', (event) => {
    callback(event.detail.message);
  });
};

// 获取用户的所有会话
export const getUserConversations = (userId) => {
  const messages = localStorage.getItem(MESSAGES_KEY);
  const allMessages = messages ? JSON.parse(messages) : [];
  const users = getAllUsers();
  
  const conversations = new Map();
  
  allMessages.forEach(msg => {
    if (msg.senderId === userId || msg.receiverId === userId) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversations.has(otherId)) {
        const otherUser = users.find(u => u.id === otherId);
        conversations.set(otherId, {
          id: otherId,
          user: otherUser,
          lastMessage: msg.content,
          unreadCount: msg.receiverId === userId && !msg.read ? 1 : 0,
          timestamp: msg.timestamp
        });
      } else {
        const conv = conversations.get(otherId);
        if (msg.timestamp > conv.timestamp) {
          conv.lastMessage = msg.content;
          conv.timestamp = msg.timestamp;
        }
        if (msg.receiverId === userId && !msg.read) {
          conv.unreadCount++;
        }
      }
    }
  });
  
  return Array.from(conversations.values())
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// 标记消息为已读
export const markMessagesAsRead = (userId, otherUserId) => {
  const messages = localStorage.getItem(MESSAGES_KEY);
  const allMessages = messages ? JSON.parse(messages) : [];
  
  const updatedMessages = allMessages.map(msg => {
    if (msg.senderId === otherUserId && msg.receiverId === userId && !msg.read) {
      return { ...msg, read: true };
    }
    return msg;
  });
  
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));
}; 