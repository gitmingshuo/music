import Pusher from 'pusher-js';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

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
    if (this.currentUserId === userId && this.channel) {
      return;
    }

    this.disconnect();
    this.currentUserId = userId;
    this.channel = this.pusher.subscribe(`chat-${userId}`);
    
    this.channel.bind('new-message', (message) => {
      console.log('WebSocket received message:', message);
      const processedMessage = {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        timestamp: message.timestamp
      };
      this.messageCallbacks.forEach(callback => callback(processedMessage));
    });

    this.pusher.connection.bind('connected', () => {
      console.log('Connected to Pusher');
    });

    this.pusher.connection.bind('error', (err) => {
      console.error('Pusher connection error:', err);
    });
  }

  sendMessage(messageData) {
    console.log('Sending message:', messageData);
    
    if (!messageData.message || !messageData.message.receiverId) {
      console.error('Invalid message format:', messageData);
      return Promise.reject(new Error('Invalid message format'));
    }

    return fetch(`${API_BASE_URL}${API_ENDPOINTS.SEND_MESSAGE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(messageData)
    }).then(response => {
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }
      return response.json();
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
      this.channel = null;
    }
  }
}

export const wsService = new WebSocketService(); 