import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, register } = useUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请填写所有字段');
      return;
    }

    const success = isLogin ? login(username, password) : register(username, password);
    
    if (success) {
      // 登录成功后跳转到首页或者之前的页面
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setError(isLogin ? '用户名或密码错误' : '用户名已存在');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLogin ? '登录' : '注册'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-btn">
            {isLogin ? '登录' : '注册'}
          </button>
        </form>
        <p className="switch-mode" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? '没有账号？点击注册' : '已有账号？点击登录'}
        </p>
      </div>
    </div>
  );
}

export default Login;