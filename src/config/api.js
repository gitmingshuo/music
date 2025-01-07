const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment
  ? 'http://localhost:3001'
  : '';

export const WS_URL = isDevelopment
  ? 'ws://localhost:3001'
  : `wss://${window.location.host}`;

export const API_ENDPOINTS = {
  UNREAD_COUNT: '/api/messages/unread-count',
  SEND_MESSAGE: '/api/send-message',
  MARK_READ: '/api/messages/mark-read'
};

export const PUSHER_CONFIG = {
  key: '4b522f1169d2c59a5253',
  cluster: 'ap1',
  encrypted: true,
  forceTLS: true
};

export const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include'
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || '请求失败');
      } catch (parseError) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }
    }

    return response.json();
  } catch (error) {
    console.error('API 请求错误:', error);
    throw error;
  }
}; 