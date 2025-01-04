import Pusher from 'pusher-js';

class WebSocketService {
  constructor() {
    this.currentUserId = null;
    this.pusher = new Pusher('4b522f1169d2c59a5253', {
      cluster: 'ap1',
      encrypted: true
    });
    this.channel = null;
    this.messageCallbacks = new Set();
  }

  connect(userId) {
    this.currentUserId = userId;
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
    if (this.channel && this.currentUserId) {
      this.channel.unbind_all();
      this.pusher.unsubscribe(`chat-${this.currentUserId}`);
      this.currentUserId = null;
    }
  }
}

export const wsService = new WebSocketService(); 