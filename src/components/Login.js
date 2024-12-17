import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !password) {
      setErrorMsg('请输入用户名和密码');
      return;
    }

    const success = login(username, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>登录</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="用户名"
              maxLength={20}
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              maxLength={20}
            />
          </div>
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          <button type="submit" className="login-button">登录</button>
        </form>
        <div className="login-footer">
          <span>还没有账号？</span>
          <span className="register-link" onClick={() => navigate('/register')}>
            立即注册
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;