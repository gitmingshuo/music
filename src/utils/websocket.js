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
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.pusher.connection.bind('connected', () => {
      console.log('Connected to Pusher');
    });
  }

  sendMessage(messageData) {
    console.log('Sending message:', messageData);
    return fetch(`${API_BASE_URL}${API_ENDPOINTS.SEND_MESSAGE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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