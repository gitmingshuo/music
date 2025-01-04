import { getUserConversations } from '../../src/utils/messageStorage';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const conversations = await getUserConversations(userId);
    const unreadCount = conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);

    res.status(200).json({ count: unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
} 