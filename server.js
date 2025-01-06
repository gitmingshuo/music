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
  appId: process.env.PUSHER_APP_ID || '1920738',
  key: process.env.PUSHER_KEY || '4b522f1169d2c59a5253',
  secret: process.env.PUSHER_SECRET || '8b7948135891378f5fb0',
  cluster: process.env.PUSHER_CLUSTER || 'ap1',
  useTLS: true,
  encrypted: true
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

    // 更新接收者的未读消息计数
    const currentCount = unreadMessages.get(message.receiverId) || 0;
    unreadMessages.set(message.receiverId, currentCount + 1);

    // 分别触发发送者和接收者的频道
    await Promise.all([
      pusher.trigger(`chat-${message.receiverId}`, 'new-message', message),
      pusher.trigger(`chat-${message.senderId}`, 'new-message', message)
    ]);
    
    console.log('Message sent successfully to channels:', {
      receiver: `chat-${message.receiverId}`,
      sender: `chat-${message.senderId}`
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// 添加标记消息已读的路由
app.post('/api/messages/mark-read', (req, res) => {
  try {
    const { userId, otherUserId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // 重置用户的未读消息计数
    unreadMessages.set(userId, 0);
    
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