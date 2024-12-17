import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { register } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 基本验证
    if (!username || !password) {
      setErrorMsg('请输入用户名和密码');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('两次输入的密码不一致');
      return;
    }

    try {
      await register(username, password);
      navigate('/login');
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>注册</h2>
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
          <div className="input-group">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="确认密码"
              maxLength={20}
            />
          </div>
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          <button type="submit" className="register-button">注册</button>
        </form>
        <div className="register-footer">
          <span>已有账号？</span>
          <span className="login-link" onClick={() => navigate('/login')}>
            立即登录
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register; 