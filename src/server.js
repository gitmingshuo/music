const express = require('express');
const Pusher = require('pusher');
const cors = require('cors');
const app = express();

// 添加一个简单的内存存储来跟踪未读消息
const unreadMessages = new Map();

// CORS 配置
app.use(cors({
  origin: ['http://localhost:3000', 'https://mingshuo.website'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const pusher = new Pusher({
  appId: '1920738',
  key: '4b522f1169d2c59a5253',
  secret: '8b7948135891378f5fb0',
  cluster: 'ap1',
  useTLS: true
});

// 添加未读消息计数路由
app.get('/api/messages/unread-count', (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // 从 Map 中获取未读消息数量，如果不存在则返回 0
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

    // 只更新接收者的未读消息计数
    const currentCount = unreadMessages.get(message.receiverId) || 0;
    unreadMessages.set(message.receiverId, currentCount + 1);
    console.log('Updated unread count for receiver:', {
      receiverId: message.receiverId,
      count: currentCount + 1
    });

    // 使用 Promise.all 同时触发两个通道的消息
    await Promise.all([
      // 发送给接收者的消息包含未读标记
      pusher.trigger(`chat-${message.receiverId}`, 'new-message', {
        type: 'chat',
        message: {
          ...message,
          unread: true
        }
      }),
      // 发送给发送者的消息不包含未读标记
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

    // 重置用户的未读消息计数
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 