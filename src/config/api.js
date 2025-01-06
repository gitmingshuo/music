const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001'
  : 'https://mingshuo.website';

export const API_ENDPOINTS = {
  UNREAD_COUNT: '/api/messages/unread-count',
  SEND_MESSAGE: '/api/send-message',
  MARK_READ: '/api/messages/mark-read'
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
    console.log('Making API request to:', url, options);
    const response = await fetch(url, { 
      ...defaultOptions, 
      ...options 
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}; 