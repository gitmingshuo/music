import { openDB } from 'idb';

const DB_NAME = 'ChatDB';
const DB_VERSION = 1;

// 初始化数据库
async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 创建消息存储
      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('conversationId', 'conversationId');
        messageStore.createIndex('timestamp', 'timestamp');
      }
      
      // 创建会话存储
      if (!db.objectStoreNames.contains('conversations')) {
        const conversationStore = db.createObjectStore('conversations', { keyPath: 'id' });
        conversationStore.createIndex('userId', 'userId');
      }
    },
  });
  return db;
}

// 获取数据库连接
export async function getDB() {
  return await initDB();
}

// 保存消息
export async function saveMessageToDB(message) {
  const db = await getDB();
  const tx = db.transaction('messages', 'readwrite');
  await tx.store.add({
    ...message,
    conversationId: [message.senderId, message.receiverId].sort().join('-')
  });
  await tx.done;
  
  // 广播消息到其他标签页
  broadcastMessage('new-message', message);
}

// 获取会话消息
export async function getConversationMessages(userId1, userId2) {
  const db = await getDB();
  const conversationId = [userId1, userId2].sort().join('-');
  const messages = await db.getAllFromIndex('messages', 'conversationId', conversationId);
  return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// 更新会话
export async function updateConversation(conversation) {
  const db = await getDB();
  const tx = db.transaction('conversations', 'readwrite');
  await tx.store.put(conversation);
  await tx.done;
}

// 获取用户的所有会话
export async function getUserConversations(userId) {
  const db = await getDB();
  const conversations = await db.getAllFromIndex('conversations', 'userId', userId);
  return conversations;
}

// 广播消息到其他标签页
function broadcastMessage(type, data) {
  const channel = new BroadcastChannel('chat-channel');
  channel.postMessage({ type, data });
}

// 监听消息
export function listenToMessages(callback) {
  const channel = new BroadcastChannel('chat-channel');
  channel.onmessage = (event) => {
    if (event.data.type === 'new-message') {
      callback(event.data.data);
    }
  };
  return () => channel.close();
} 