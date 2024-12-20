import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginAPI, registerAPI } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [state, setState] = useState({
    currentUser: undefined,
    isLoading: true,
    error: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    setState(prev => ({
      ...prev,
      currentUser: savedUser ? JSON.parse(savedUser) : null,
      isLoading: false
    }));
  }, []);

  const handleLogin = async (credentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { token, user } = await loginAPI(credentials);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setState(prev => ({
        ...prev,
        currentUser: user,
        isLoading: false
      }));

      navigate('/', { replace: true });
      return { success: true };
    } catch (error) {
      setState(prev => ({
        ...prev,
        error,
        isLoading: false
      }));
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState(prev => ({
      ...prev,
      currentUser: null,
      isLoading: false
    }));
    navigate('/login', { replace: true });
  };

  const handleRegister = async (userData) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { token, user } = await registerAPI(userData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setState(prev => ({
        ...prev,
        currentUser: user,
        isLoading: false
      }));

      navigate('/', { replace: true });
      return { success: true };
    } catch (error) {
      setState(prev => ({
        ...prev,
        error,
        isLoading: false
      }));
      throw error;
    }
  };

  return (
    <UserContext.Provider 
      value={{
        ...state,
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const dailyTasks = [
  { id: 1, title: '每日登录', exp: 10, description: '登录即可获得经验' },
  { id: 2, title: '收听音乐30分钟', exp: 20, description: '累计收听音乐30分钟' },
  { id: 3, title: '分享一首歌曲', exp: 15, description: '分享任意一首歌曲' },
  { id: 4, title: '收藏一首歌曲', exp: 15, description: '收藏任意一首歌曲' }
];