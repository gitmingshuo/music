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
    console.log('Connecting WebSocket for user:', userId);
    if (this.currentUserId === userId && this.channel) {
      console.log('Already connected for user:', userId);
      return;
    }

    this.disconnect();
    this.currentUserId = userId;
    
    this.channel = this.pusher.subscribe(`chat-${userId}`);
    
    this.channel.bind('new-message', (data) => {
      console.log('WebSocket received message:', data);
      this.messageCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in message callback:', error);
        }
      });
    });

    console.log('WebSocket connected for user:', userId);
  }

  onMessage(callback) {
    console.log('Adding message callback');
    this.messageCallbacks.add(callback);
    return () => {
      console.log('Removing message callback');
      this.messageCallbacks.delete(callback);
    };
  }

  async sendMessage(messageData) {
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

  disconnect() {
    if (this.channel && this.currentUserId) {
      console.log('Disconnecting WebSocket for user:', this.currentUserId);
      this.channel.unbind_all();
      this.pusher.unsubscribe(`chat-${this.currentUserId}`);
      this.currentUserId = null;
      this.channel = null;
      this.messageCallbacks.clear();
    }
  }
}

export const wsService = new WebSocketService(); 