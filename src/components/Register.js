import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const { register } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 表单验证
    if (!formData.username || !formData.password) {
      setError('请填写所有必填项');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    try {
      setLoading(true);
      await register({
        username: formData.username,
        password: formData.password
      });
      navigate('/'); // 注册成功后跳转到首页
    } catch (err) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="register-container">
      <h1>注册</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="用户名"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="密码"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            placeholder="确认密码"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '注册中...' : '注册'}
        </button>
      </form>
      <div className="login-link">
        已有账号？ <span onClick={() => navigate('/login')}>立即登录</span>
      </div>
    </div>
  );
}

export default Register; 