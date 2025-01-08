const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const url = require('url');
const Pusher = require('pusher');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 初始化 Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '1920738',
  key: process.env.PUSHER_KEY || '4b522f1169d2c59a5253',
  secret: process.env.PUSHER_SECRET || '8b7948135891378f5fb0',
  cluster: process.env.PUSHER_CLUSTER || 'ap1',
  useTLS: true
});

// 存储用户连接和未读消息
const clients = new Map();
const unreadMessages = new Map();

// CORS 中间件
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// 添加未读消息计数路由
app.get('/api/messages/unread-count', (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  const count = unreadMessages.get(userId) || 0;
  res.json({ count });
});

// 添加消息发送路由
app.post('/api/send-message', async (req, res) => {
  try {
    const { type, message } = req.body;
    console.log('Server received message:', { type, message });

    // 更新未读消息计数
    const currentCount = unreadMessages.get(message.receiverId) || 0;
    unreadMessages.set(message.receiverId, currentCount + 1);

    // 发送给接收者
    await pusher.trigger(
      `chat-${message.receiverId}`,
      'new-message',
      {
        type: 'chat',
        message: {
          ...message,
          unread: true
        }
      }
    );

    // 发送给发送者
    await pusher.trigger(
      `chat-${message.senderId}`,
      'new-message',
      {
        type: 'chat',
        message: {
          ...message,
          unread: false
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// 添加标记消息已读路由
app.post('/api/messages/mark-read', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  unreadMessages.set(userId, 0);
  res.json({ success: true });
});

// WebSocket 连接处理
wss.on('connection', (ws, req) => {
  const userId = url.parse(req.url, true).query.userId;
  clients.set(userId, ws);

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.type === 'chat') {
      const { receiverId } = message.message;
      const receiverWs = clients.get(receiverId);
      if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
        receiverWs.send(JSON.stringify(message));
      }
    }
  });

  ws.on('close', () => {
    clients.delete(userId);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 添加错误处理
server.on('error', (error) => {
  console.error('Server error:', error);
});

// 优雅关闭
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 