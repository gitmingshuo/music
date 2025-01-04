import Pusher from 'pusher-js';

class WebSocketService {
  constructor() {
    // 使用你在 Pusher 控制台看到的 key 和 cluster
    this.pusher = new Pusher('你的key', {
      cluster: '你的cluster',
      encrypted: true
    });
    this.channel = null;
    this.messageCallbacks = new Set();
  }

  connect(userId) {
    // 为每个用户创建频道
    this.channel = this.pusher.subscribe(`chat-${userId}`);
    
    this.channel.bind('new-message', (data) => {
      this.messageCallbacks.forEach(callback => callback(data));
    });
  }

  sendMessage(message) {
    // 使用 Vercel Serverless Function 发送消息
    fetch('/api/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });
  }

  onMessage(callback) {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  disconnect() {
    if (this.channel) {
      this.channel.unbind_all();
      this.pusher.unsubscribe(`chat-${userId}`);
    }
  }
}

export const wsService = new WebSocketService(); 