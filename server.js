const express = require('express');
const Pusher = require('pusher');
const cors = require('cors');
const app = express();

// CORS 配置
app.use(cors({
  origin: '*',  // 允许所有来源
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

// 发送消息路由
app.post('/api/send-message', async (req, res) => {
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