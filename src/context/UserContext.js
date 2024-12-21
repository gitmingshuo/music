import React, { createContext, useContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username, password) => {
    // 从 localStorage 获取用户信息
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userInfo = users[username];
    
    if (userInfo && userInfo.password === password) {
      const userData = {
        username,
        avatar: userInfo.avatar,
        isLoggedIn: true
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = (username, password) => {
    try {
      // 获取现有用户
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      
      // 检查用户名是否已存在
      if (users[username]) {
        throw new Error('用户名已存在');
      }

      // 限制用户数据大小
      const userData = {
        username,
        password,
        avatar: null,
        favorites: [],
        recentPlays: []
      };

      // 检查数据大小
      const dataSize = new Blob([JSON.stringify(userData)]).size;
      if (dataSize > 1024 * 1024) { // 1MB 限制
        throw new Error('用户数据过大');
      }

      // 尝试存储
      try {
        users[username] = userData;
        localStorage.setItem('users', JSON.stringify(users));
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          throw new Error('存储空间已满，请清理后重试');
        }
        throw e;
      }
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);