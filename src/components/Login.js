import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login, register } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请填写完整信息');
      return;
    }

    if (isLogin) {
      // 登录
      if (login(username, password)) {
        navigate('/');
      } else {
        setError('用户名或密码错误');
      }
    } else {
      // 注册
      if (register(username, password)) {
        navigate('/');
      } else {
        setError('用户名已存在');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLogin ? '登录' : '注册'}</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn">
            {isLogin ? '登录' : '注册'}
          </button>
        </form>

        <div className="switch-form">
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;