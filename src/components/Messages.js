const Messages = () => {
  const { currentMessages, currentChat } = useMessage();
  
  console.log('Messages component render:', {
    currentChat,
    messageCount: currentMessages.length,
    messages: currentMessages
  });

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;
    
    console.log('Attempting to send message:', {
      receiverId: currentChat,
      content: content
    });

    try {
      const success = await sendMessage(currentChat, content);
      if (success) {
        console.log('Message sent successfully');
        // 清空输入框
        setInputMessage('');
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const onKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage);
    }
  };

  // ... 其他代码
}; 