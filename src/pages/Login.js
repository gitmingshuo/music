import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import { validateUser } from '../utils/userStorage';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('用户名和密码不能为空');
      return;
    }

    if (isLogin) {
      // 登录逻辑
      const user = validateUser(username, password);
      if (user) {
        login(user);
        navigate('/');
      } else {
        setError('用户名或密码错误');
      }
    } else {
      // 注册逻辑
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some(u => u.username === username)) {
        setError('用户名已存在');
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        username,
        password,
        avatar: '/default-avatar.png',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      login(newUser);
      navigate('/');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLogin ? '登录' : '注册'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            {isLogin ? '登录' : '注册'}
          </button>
        </form>
        <p className="switch-text">
          {isLogin ? '没有账号？' : '已有账号？'}
          <button 
            className="switch-btn"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? '注册' : '登录'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login; 