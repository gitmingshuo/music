import Pusher from 'pusher-js';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class WebSocketService {
  constructor() {
    this.currentUserId = null;
    this.pusher = new Pusher('4b522f1169d2c59a5253', {
      cluster: 'ap1',
      encrypted: true,
      forceTLS: true,
      timeout: 20000
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
    
    try {
      this.channel = this.pusher.subscribe(`chat-${userId}`);
      
      this.channel.bind('pusher:subscription_succeeded', () => {
        console.log('Successfully subscribed to channel');
      });

      this.channel.bind('pusher:subscription_error', (error) => {
        console.error('Subscription error:', error);
      });
      
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
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
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
    const url = `${API_BASE_URL}${API_ENDPOINTS.SEND_MESSAGE}`;
    console.log('Sending message to:', url);
    console.log('Message data:', messageData);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SEND_MESSAGE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'chat',
          message: messageData.message
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const result = await response.json();
      console.log('Message sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
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