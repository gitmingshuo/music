import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 验证用户数据的有效性
  const validateUser = (userData) => {
    return userData && 
           typeof userData === 'object' && 
           typeof userData.username === 'string' &&
           typeof userData.password === 'string';
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (validateUser(userData)) {
          setUser(userData);
        } else {
          // 数据无效，清除存储
          localStorage.removeItem('user');
        }
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    if (!validateUser(userData)) {
      console.error('Invalid user data:', userData);
      return;
    }
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 