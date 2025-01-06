import React, { useState, useEffect } from 'react';

function Chat() {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // 假设您已经初始化了 Pusher
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