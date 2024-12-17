import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    // 从 localStorage 获取当前用户
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [users, setUsers] = useState(() => {
    // 从 localStorage 获取所有用户数据
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  // 当用户列表改变时，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // 当当前用户改变时，保存到 localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // 注册新用户
  const register = (username, password) => {
    // 检查用户名是否已存在
    if (users.some(user => user.username === username)) {
      throw new Error('用户名已存在');
    }

    const newUser = {
      id: Date.now(),
      username,
      password,
      avatar: null,
      favorites: [],
      recentPlays: [],
      settings: {
        theme: 'dark',
        notifications: true,
        playHistory: true,
        bio: '',
        level: 1,
        exp: 0,
        nextLevelExp: 1000,
        completedTasks: []
      }
    };

    setUsers(prevUsers => [...prevUsers, newUser]);
    return newUser;
  };

  // 用户登录
  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('用户名或密码错误');
    }
    setCurrentUser(user);
    return user;
  };

  // 用户登出
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // 更新用户信息
  const updateUser = (updatedUser) => {
    setUsers(prevUsers => 
      prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  // 更新用户收藏列表
  const updateUserFavorites = (favorites) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      favorites
    };
    updateUser(updatedUser);
  };

  // 更新用户设置
  const updateUserSettings = (settings) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      settings: {
        ...currentUser.settings,
        ...settings
      }
    };
    updateUser(updatedUser);
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      register,
      login,
      logout,
      updateUser,
      updateUserFavorites,
      updateUserSettings
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

// 每日任务数据
export const dailyTasks = [
  { id: 1, title: '每日登录', exp: 10, description: '登录即可获得经验' },
  { id: 2, title: '收听音乐30分钟', exp: 20, description: '累计收听音乐30分钟' },
  { id: 3, title: '分享一首歌曲', exp: 15, description: '分享任意一首歌曲' },
  { id: 4, title: '收藏一首歌曲', exp: 15, description: '收藏任意一首歌曲' }
];