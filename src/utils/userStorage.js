// 存储键常量
const USERS_KEY = 'users';
const FOLLOWS_KEY = 'follows';
const MESSAGES_KEY = 'messages';

// 初始化默认用户
export const initializeDefaultUsers = () => {
  const defaultUsers = [
    { id: '1', username: 'user1', password: '123456', avatar: '/default-avatar.png' },
    { id: '2', username: 'user2', password: '123456', avatar: '/default-avatar.png' },
    { id: '3', username: 'user3', password: '123456', avatar: '/default-avatar.png' },
    { id: '4', username: 'user4', password: '123456', avatar: '/default-avatar.png' },
    { id: '5', username: 'jay', password: '123456', avatar: '/default-avatar.png' },
    { id: '6', username: 'chou', password: '123456', avatar: '/default-avatar.png' }
  ];

  // 检查是否已经初始化过
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
  
  // 确保所有默认用户都存在
  const currentUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const currentUsernames = currentUsers.map(u => u.username);
  
  defaultUsers.forEach(defaultUser => {
    if (!currentUsernames.includes(defaultUser.username)) {
      currentUsers.push(defaultUser);
    }
  });
  
  localStorage.setItem(USERS_KEY, JSON.stringify(currentUsers));
};

// 用户相关操作
export const userStorage = {
  // 获取所有用户
  getAllUsers: () => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },

  // 通过用户名查找用户
  findUserByUsername: (username) => {
    const users = userStorage.getAllUsers();
    return users.find(user => user.username === username);
  },

  // 通过ID查找用户
  findUserById: (userId) => {
    const users = userStorage.getAllUsers();
    return users.find(user => user.id === userId);
  },

  // 添加新用户
  addUser: (userData) => {
    const users = userStorage.getAllUsers();
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      avatar: userData.avatar || '/default-avatar.png'
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  // 更新用户信息
  updateUser: (userId, updates) => {
    const users = userStorage.getAllUsers();
    const index = users.findIndex(user => user.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return users[index];
    }
    return null;
  },

  // 删除用户
  deleteUser: (userId) => {
    const users = userStorage.getAllUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
  }
};

// 关注系统相关操作
export const followSystem = {
  // 关注用户
  followUser: (userId, followId) => {
    const follows = JSON.parse(localStorage.getItem(FOLLOWS_KEY) || '{}');
    if (!follows[userId]) {
      follows[userId] = [];
    }
    if (!follows[userId].includes(followId)) {
      follows[userId].push(followId);
      localStorage.setItem(FOLLOWS_KEY, JSON.stringify(follows));
    }
  },

  // 取消关注
  unfollowUser: (userId, followId) => {
    const follows = JSON.parse(localStorage.getItem(FOLLOWS_KEY) || '{}');
    if (follows[userId]) {
      follows[userId] = follows[userId].filter(id => id !== followId);
      localStorage.setItem(FOLLOWS_KEY, JSON.stringify(follows));
    }
  },

  // 获取用户的关注列表
  getFollowing: (userId) => {
    const follows = JSON.parse(localStorage.getItem(FOLLOWS_KEY) || '{}');
    return follows[userId] || [];
  },

  // 获取用户的粉丝列表
  getFollowers: (userId) => {
    const follows = JSON.parse(localStorage.getItem(FOLLOWS_KEY) || '{}');
    const followers = [];
    Object.entries(follows).forEach(([followerId, followingList]) => {
      if (followingList.includes(userId)) {
        followers.push(followerId);
      }
    });
    return followers;
  },

  // 检查是否已关注
  isFollowing: (userId, followId) => {
    const follows = JSON.parse(localStorage.getItem(FOLLOWS_KEY) || '{}');
    return follows[userId]?.includes(followId) || false;
  }
};

// 导出便捷方法
export const {
  getAllUsers,
  findUserByUsername,
  findUserById,
  addUser,
  updateUser,
  deleteUser
} = userStorage;

export const {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  isFollowing
} = followSystem;

// 初始化默认用户
initializeDefaultUsers();

// 登录验证函数
export const validateUser = (username, password) => {
  const users = getAllUsers();
  const user = users.find(user => 
    user.username.toLowerCase() === username.toLowerCase() && 
    user.password === password
  );
  return user; // 直接返回用户对象，而不是布尔值
}; 