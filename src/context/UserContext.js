import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    loading: false,
    error: null
  });

  const handleLogin = async (credentials) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setState(prev => ({
        ...prev,
        user,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || '登录失败',
        loading: false
      }));
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setState(prev => ({
      ...prev,
      user: null
    }));
  };

  const handleRegister = async (userData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await axios.post('/api/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setState(prev => ({
        ...prev,
        user,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || '注册失败',
        loading: false
      }));
      throw error;
    }
  };

  return (
    <UserContext.Provider 
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
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

export default UserContext;