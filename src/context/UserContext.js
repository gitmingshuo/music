import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

// 模拟用户数据库
const USERS_DB = [
  {
    id: 1,
    username: 'demo',
    password: '123456',
    avatar: null,
    favorites: [], // 每个用户独立的收藏列表
    recentPlays: [],
    settings: {  // 添加用户设置
      theme: 'dark',
      notifications: true,
      playHistory: true,
      bio: 'hi',
      level: 1,
      exp: 0,
      nextLevelExp: 1000,
      completedTasks: []
    }
  }
];

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [userSettings, setUserSettings] = useState(() => {
    if (currentUser?.settings) {
      return currentUser.settings;
    }
    return {
      theme: 'dark',
      notifications: true,
      playHistory: true,
      bio: '',
      level: 1,
      exp: 0,
      nextLevelExp: 1000,
      completedTasks: []
    };
  });

  // 添加任务完成功能
  const completeTask = (taskId) => {
    if (!currentUser) return;

    const updatedSettings = {
      ...userSettings,
      completedTasks: [...userSettings.completedTasks, taskId],
      exp: userSettings.exp + 100, // 每完成一个任务加100经验
      level: Math.floor((userSettings.exp + 100) / 1000) + 1 // 更新等级
    };

    setUserSettings(updatedSettings);
    saveUserData({
      ...currentUser,
      settings: updatedSettings
    });
  };

  // 保存用户数据到本地存储
  const saveUserData = (userData) => {
    const dataToSave = {
      ...userData,
      settings: userSettings // 确保保存用户设置
    };
    localStorage.setItem('currentUser', JSON.stringify(dataToSave));
    setCurrentUser(dataToSave);
    
    const userIndex = USERS_DB.findIndex(u => u.id === userData.id);
    if (userIndex !== -1) {
      USERS_DB[userIndex] = { ...USERS_DB[userIndex], ...dataToSave };
    }
  };

  const login = (username, password) => {
    const user = USERS_DB.find(u => u.username === username);
    
    if (!user || user.password !== password) {
      return false;
    }

    const userData = {
      ...user,
      password: undefined
    };

    setUserSettings(userData.settings || {
      theme: 'dark',
      notifications: true,
      playHistory: true,
      bio: '',
      level: 1,
      exp: 0,
      nextLevelExp: 1000,
      completedTasks: []
    });

    saveUserData(userData);
    return true;
  };

  const updateUserAvatar = (avatarUrl) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      avatar: avatarUrl
    };

    saveUserData(updatedUser);
  };

  const updateUserFavorites = (favorites) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      favorites
    };

    saveUserData(updatedUser);
  };

  // 更新用户设置
  const updateUserSettings = (newSettings) => {
    const updatedSettings = {
      ...userSettings,
      ...newSettings
    };
    setUserSettings(updatedSettings);
    
    if (currentUser) {
      saveUserData({
        ...currentUser,
        settings: updatedSettings
      });
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    userSettings,
    login,
    logout,
    updateUserAvatar,
    updateUserFavorites,
    updateUserSettings,
    completeTask
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// 每日任务数据
export const dailyTasks = [
  { id: 1, title: '每日登录', exp: 10, description: '登录即可获得经验' },
  { id: 2, title: '收听音乐30分钟', exp: 20, description: '累计收听音乐30分钟' },
  { id: 3, title: '分享一首歌曲', exp: 15, description: '分享任意一首歌曲' },
  { id: 4, title: '收藏一首歌曲', exp: 15, description: '收藏任意一首歌曲' }
];