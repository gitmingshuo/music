export default async function handler(req, res) {
  // 添加 CORS 头
  res.setHeader('Access-Control-Allow-Origin', 'https://www.mingshuo.website');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('Received non-POST request:', req.method); // 添加日志
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, chatId } = req.body;
    console.log('Mark read request:', { userId, chatId }); // 添加日志
    
    if (!userId || !chatId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // TODO: 实现标记已读逻辑
    // 临时返回成功
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 