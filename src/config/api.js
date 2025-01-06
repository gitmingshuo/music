const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
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
    console.log('Making API request to:', url);
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      console.error('API request failed:', {
        status: response.status,
        statusText: response.statusText,
        url: url
      });
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    if (endpoint.includes('unread-count')) {
      return { count: 0 }; // 未读消息接口的降级处理
    }
    throw error;
  }
}; 