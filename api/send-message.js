const Pusher = require('pusher');

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '1920738',
  key: process.env.PUSHER_KEY || '4b522f1169d2c59a5253',
  secret: process.env.PUSHER_SECRET || '8b7948135891378f5fb0',
  cluster: process.env.PUSHER_CLUSTER || 'ap1',
  useTLS: true
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, message } = req.body;
    console.log('Received message:', { type, message });

    await pusher.trigger(
      `chat-${message.receiverId}`,
      'new-message',
      {
        type: 'chat',
        message
      }
    );
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}; 