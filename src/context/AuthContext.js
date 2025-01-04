import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // 初始化时从 localStorage 读取用户信息
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // 验证用户数据的完整性
        if (parsedUser && parsedUser.id && parsedUser.username) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // 登录函数
  const login = (userData) => {
    if (!userData || !userData.id || !userData.username) {
      console.error('Invalid user data:', userData);
      return;
    }
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  // 登出函数
  const logout = () => {
    setUser(null);
    const tabId = window.sessionStorage.getItem('tabId');
    if (tabId) {
      sessionStorage.removeItem(`user_${tabId}`);
    }
    localStorage.removeItem('currentUser');
  };

  // 监听存储事件
  useEffect(() => {
    const handleStorageChange = (e) => {
      // 只有当全局存储变化时才更新当前标签页的用户状态
      if (e.key === 'currentUser') {
        const tabId = window.sessionStorage.getItem('tabId');
        const currentTabUser = sessionStorage.getItem(`user_${tabId}`);
        
        // 如果当前标签页没有特定的用户信息，则跟随全局状态
        if (!currentTabUser) {
          if (e.newValue === null) {
            setUser(null);
          } else {
            try {
              const newUser = JSON.parse(e.newValue);
              setUser(newUser);
            } catch (error) {
              console.error('Failed to parse new user data:', error);
            }
          }
        }
      }
    };

    // 为每个标签页生成唯一ID
    if (!window.sessionStorage.getItem('tabId')) {
      window.sessionStorage.setItem('tabId', Date.now().toString());
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 