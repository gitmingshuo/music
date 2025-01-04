const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001'
  : 'https://your-production-domain.com';

export const API_ENDPOINTS = {
  UNREAD_COUNT: '/api/messages/unread-count',
  SEND_MESSAGE: '/api/send-message'
};

// API 请求工具函数
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
}; 