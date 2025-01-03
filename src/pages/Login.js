import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // 验证输入
    if (!username || !password) {
      setError('用户名和密码不能为空');
      return;
    }

    try {
      // 获取并验证用户数据
      let users = [];
      try {
        const storedUsers = localStorage.getItem('users');
        users = storedUsers ? JSON.parse(storedUsers) : [];
        
        // 过滤掉无效的用户数据
        users = users.filter(user => 
          user && 
          typeof user === 'object' && 
          typeof user.username === 'string' && 
          typeof user.password === 'string'
        );
      } catch (err) {
        console.error('读取用户数据失败:', err);
        users = [];
      }

      if (isLogin) {
        // 登录逻辑
        const user = users.find(u => 
          u && u.username === username && u.password === password
        );
        
        if (user) {
          login(user);
          navigate('/');
        } else {
          setError('用户名或密码错误');
        }
      } else {
        // 注册逻辑
        // 检查用户名是否已存在
        if (users.some(u => u && u.username === username)) {
          setError('用户名已存在');
          return;
        }

        // 创建新用户对象
        const newUser = {
          id: Date.now().toString(),
          username,
          password,
          createdAt: new Date().toISOString()
        };

        // 保存新用户
        const updatedUsers = [...users, newUser];
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // 注册成功后自动登录
        login(newUser);
        navigate('/');
      }
    } catch (err) {
      console.error('操作失败:', err);
      setError('操作失败，请重试');
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