const express = require('express');
const Pusher = require('pusher');
const app = express();

// CORS 中间件
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
};

// 应用 CORS 中间件
app.use(corsMiddleware);
app.use(express.json());

// 添加一个简单的内存存储来跟踪未读消息
const unreadMessages = new Map();

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '1920738',
  key: process.env.PUSHER_KEY || '4b522f1169d2c59a5253',
  secret: process.env.PUSHER_SECRET || '8b7948135891378f5fb0',
  cluster: process.env.PUSHER_CLUSTER || 'ap1',
  useTLS: true
});

// 添加未读消息计数路由
app.get('/api/messages/unread-count', (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const count = unreadMessages.get(userId) || 0;
    console.log('Unread count for user', userId, ':', count);
    
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: error.message });
  }
});

// 修改发送消息路由，更新未读消息计数
app.post('/api/send-message', async (req, res) => {
  try {
    const { type, message } = req.body;
    console.log('Server received message:', { type, message });

    if (!message || !message.senderId || !message.receiverId || !message.content) {
      throw new Error('Invalid message format');
    }

    const currentCount = unreadMessages.get(message.receiverId) || 0;
    unreadMessages.set(message.receiverId, currentCount + 1);
    console.log('Updated unread count for receiver:', {
      receiverId: message.receiverId,
      count: currentCount + 1
    });

    await Promise.all([
      pusher.trigger(`chat-${message.receiverId}`, 'new-message', {
        type: 'chat',
        message: {
          ...message,
          unread: true
        }
      }),
      pusher.trigger(`chat-${message.senderId}`, 'new-message', {
        type: 'chat',
        message: {
          ...message,
          unread: false
        }
      })
    ]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// 修改标记消息已读的路由
app.post('/api/messages/mark-read', (req, res) => {
  try {
    const { userId, otherUserId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const conversationId = [userId, otherUserId].sort().join('-');
    const userUnreadMessages = unreadMessages.get(userId) || 0;
    
    if (userUnreadMessages > 0) {
      unreadMessages.set(userId, 0);
      console.log('Reset unread count for user:', userId);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// 移除 app.listen，改为导出 app
module.exports = app; 