const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');

module.exports = function(app) {
  // 简化的静态文件处理
  app.use('/static', (req, res, next) => {
    const filePath = path.join(__dirname, '../public/static', req.path);
    console.log('访问文件:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('文件不存在:', filePath);
      return res.status(404).send('文件不存在');
    }
    next();
  });

  // 简化的代理配置
  const proxyConfig = {
    target: 'http://localhost:3000',
    changeOrigin: true,
    headers: {
      'Accept': '*/*',
      'Accept-Encoding': 'identity',
      'Connection': 'keep-alive',
      // 减小请求头大小
      'User-Agent': 'Music-App'
    }
  };

  app.use('/static', createProxyMiddleware(proxyConfig));
}; 