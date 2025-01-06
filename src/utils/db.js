import { openDB } from 'idb';

const DB_NAME = 'ChatDB';
const DB_VERSION = 1;

async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('conversationId', 'conversationId');
        messageStore.createIndex('timestamp', 'timestamp');
      }
      
      if (!db.objectStoreNames.contains('conversations')) {
        const conversationStore = db.createObjectStore('conversations', { keyPath: 'id' });
        conversationStore.createIndex('userId', 'userId');
      }
    },
  });
  return db;
}

export async function getDB() {
  return await initDB();
}

export async function saveMessageToDB(message) {
  const db = await getDB();
  const conversationId = [message.senderId, message.receiverId].sort().join('-');
  
  try {
    const messageToSave = {
      ...message,
      conversationId,
      timestamp: new Date(message.timestamp).toISOString()
    };
    
    await db.put('messages', messageToSave);
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
    const messages = await db.getAllFromIndex('messages', 'conversationId', conversationId);
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