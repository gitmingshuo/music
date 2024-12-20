// 模拟 API 延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟用户数据存储
const users = new Map();

// 验证 token
export const validateToken = async (token) => {
  await delay(500); // 模拟网络请求
  
  try {
    // 这里应该是实际的 API 调用
    // 现在先模拟验证逻辑
    if (token && token.length > 10) {
      return { valid: true };
    }
    return { valid: false };
  } catch (error) {
    console.error('Token 验证失败:', error);
    throw new Error('Token 验证失败');
  }
};

// 登录 API
export const loginAPI = async (credentials) => {
  await delay(800); // 模拟网络请求
  
  try {
    // 验证输入
    if (!credentials.username || !credentials.password) {
      throw new Error('用户名和密码不能为空');
    }

    // 检查是否是新注册用户
    const storedUser = users.get(credentials.username);
    
    // 模拟登录验证
    // 这里为了测试方便，如果用户不存在，就自动注册
    if (!storedUser) {
      const newUser = {
        id: Date.now(),
        username: credentials.username,
        password: credentials.password, // 实际项目中应该加密存储
        avatar: null
      };
      users.set(credentials.username, newUser);
    }

    // 返回登录成功信息
    return {
      token: 'mock_token_' + Date.now(),
      user: {
        id: Date.now(),
        username: credentials.username,
        avatar: null
      }
    };
  } catch (error) {
    console.error('登录失败:', error);
    throw new Error(error.message || '登录失败，请检查用户名和密码');
  }
};

// 添加注册 API
export const registerAPI = async (userData) => {
  await delay(800);
  
  try {
    if (!userData.username || !userData.password) {
      throw new Error('用户名和密码不能为空');
    }

    // 检查用户是否已存在
    if (users.has(userData.username)) {
      throw new Error('用户名已存在');
    }

    // 存储新用户
    const newUser = {
      id: Date.now(),
      username: userData.username,
      password: userData.password,
      avatar: null
    };
    users.set(userData.username, newUser);

    // 返回注册成功信息
    return {
      token: 'mock_token_' + Date.now(),
      user: {
        id: newUser.id,
        username: newUser.username,
        avatar: null
      }
    };
  } catch (error) {
    console.error('注册失败:', error);
    throw new Error(error.message || '注册失败');
  }
}; 