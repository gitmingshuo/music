const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const url = require('url');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 存储用户连接
const clients = new Map();

wss.on('connection', (ws, req) => {
  const userId = url.parse(req.url, true).query.userId;
  
  // 保存用户连接
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

server.listen(3001, () => {
  console.log('WebSocket server running on port 3001');
}); 