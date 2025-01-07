import { openDB as idbOpenDB } from 'idb';

const DB_NAME = 'chatDB';
const DB_VERSION = 2;

export const openDB = async () => {
  return idbOpenDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 创建消息存储
      if (!db.objectStoreNames.contains('messages')) {
        const messagesStore = db.createObjectStore('messages', { 
          keyPath: 'timestamp' 
        });
        // 添加会话ID索引
        messagesStore.createIndex('conversationId', 'conversationId');
        // 添加发送者和接收者的复合索引
        messagesStore.createIndex('participants', ['senderId', 'receiverId']);
      }
      
      // 创建会话存储
      if (!db.objectStoreNames.contains('conversations')) {
        const conversationsStore = db.createObjectStore('conversations', { 
          keyPath: 'id' 
        });
        // 添加用户ID索引
        conversationsStore.createIndex('userId', 'userId');
        conversationsStore.createIndex('timestamp', 'timestamp');
      }
    },
  });
};

export async function getDB() {
  return await openDB();
}

export async function saveMessageToDB(message) {
  const db = await getDB();
  const conversationId = [message.senderId, message.receiverId].sort().join('-');
  
  try {
    console.log('Saving message to DB:', message);
    const messageToSave = {
      ...message,
      conversationId,
      timestamp: new Date(message.timestamp).toISOString()
    };
    
    await db.put('messages', messageToSave);
    console.log('Message saved successfully');
    return messageToSave;
  } catch (error) {
    console.error('Error saving message to DB:', error);
    throw error;
  }
}

export async function getConversationMessages(userId1, userId2) {
  const db = await getDB();
  const conversationId = [userId1, userId2].sort().join('-');
  
  try {
    // 使用 getAll 获取所有消息，然后在内存中过滤
    const allMessages = await db.getAll('messages');
    console.log('All messages from DB:', allMessages);
    const messages = allMessages.filter(msg => {
      const msgConvId = [msg.senderId, msg.receiverId].sort().join('-');
      console.log('Comparing:', msgConvId, conversationId);
      return msgConvId === conversationId;
    });
    console.log('Filtered messages:', messages);
    return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
}

export const updateConversation = async (conversation) => {
  try {
    if (!conversation || !conversation.id) {
      throw new Error('Invalid conversation object: missing id');
    }

    const db = await getDB();
    const existingConv = await db.get('conversations', conversation.id);
    
    const conversationToSave = {
      ...existingConv,
      ...conversation,
      timestamp: conversation.timestamp || existingConv?.timestamp || new Date().toISOString(),
      lastMessage: conversation.lastMessage || existingConv?.lastMessage || '',
      unreadCount: conversation.unreadCount ?? 0
    };

    await db.put('conversations', conversationToSave);
    console.log('Saved conversation with unread count:', conversationToSave);
    return conversationToSave;
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
};

export async function getDBConversations(userId) {
  try {
    const db = await getDB();
    const allConversations = await db.getAll('conversations');
    
    return allConversations.filter(conv => 
      conv && conv.id && 
      (conv.userId === userId || conv.otherUserId === userId)
    );
  } catch (error) {
    console.error('Error getting conversations from DB:', error);
    return [];
  }
} 