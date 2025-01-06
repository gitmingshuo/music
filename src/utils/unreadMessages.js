import { getDB } from './db';

export const getUnreadCount = async (userId) => {
  try {
    const db = await getDB();
    const conversations = await db.getAllFromIndex('conversations', 'userId', userId);
    return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}; 