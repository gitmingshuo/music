const express = require('express');
const Pusher = require('pusher');
const cors = require('cors');
const app = express();

// CORS 配置
app.use(cors({
  // 允许的源，开发环境和生产环境
  origin: ['http://localhost:3000', 'https://your-production-domain.com'],
  // 允许的方法
  methods: ['GET', 'POST', 'OPTIONS'],
  // 允许的请求头
  allowedHeaders: ['Content-Type', 'Authorization'],
  // 允许发送凭证
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

// API 路由前缀
const API_PREFIX = '/api';

// 未读消息计数路由
app.get(`${API_PREFIX}/messages/unread-count`, async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const conversations = await getUserConversations(userId);
    const unreadCount = conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);

    res.json({ count: unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// 发送消息路由
app.post(`${API_PREFIX}/send-message`, async (req, res) => {
  try {
    const { type, message } = req.body;
    console.log('Server received message:', { type, message });

    if (!message || !message.senderId || !message.receiverId || !message.content) {
      throw new Error('Invalid message format');
    }

    await Promise.all([
      pusher.trigger(
        `chat-${message.receiverId}`,
        'new-message',
        message
      ),
      pusher.trigger(
        `chat-${message.senderId}`,
        'new-message',
        message
      )
    ]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 