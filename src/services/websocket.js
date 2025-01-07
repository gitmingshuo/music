const isDevelopment = process.env.NODE_ENV === 'development';
const WS_URL = isDevelopment 
  ? 'ws://localhost:3001'
  : 'wss://www.mingshuo.website';

class WebSocketService {
  constructor() {
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(WS_URL);
    // ... 其他代码
  }
} 