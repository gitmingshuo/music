const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001'
  : process.env.REACT_APP_API_URL;

export const API_ENDPOINTS = {
  UNREAD_COUNT: '/api/messages/unread-count',
  SEND_MESSAGE: '/api/send-message'
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    return { count: 0 };
  }
}; 