// 为每个用户创建独立的存储键
const createUserKey = (userId, key) => `user_${userId}_${key}`;

export const userStorage = {
  // 获取用户数据
  get: (userId, key, defaultValue = null) => {
    try {
      const data = localStorage.getItem(createUserKey(userId, key));
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error getting ${key} for user ${userId}:`, error);
      return defaultValue;
    }
  },

  // 保存用户数据
  set: (userId, key, value) => {
    try {
      localStorage.setItem(createUserKey(userId, key), JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} for user ${userId}:`, error);
    }
  },

  // 删除用户数据
  remove: (userId, key) => {
    localStorage.removeItem(createUserKey(userId, key));
  }
}; 