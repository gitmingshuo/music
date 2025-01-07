import React, { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { API_BASE_URL } from '../config/api';

function Chat() {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const pusher = new Pusher('4b522f1169d2c59a5253', {
      cluster: 'ap1',
      encrypted: true
    });
    
    const channel = pusher.subscribe('chat-channel');
    
    channel.bind('new-message', (data) => {
      // 关键在这里：要使用函数式更新
      setMessages(prevMessages => [...prevMessages, data]);
      // 而不是直接
      // messages.push(data) // ❌ 这样不会触发重新渲染
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []); // 空依赖数组

  return (
    <div>
      {messages.map((message, index) => (
        <div key={index}>{message.content}</div>
      ))}
    </div>
  );
}

export default Chat; 