import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  
  const { register, login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin && !formData.username) {
      newErrors.username = '请输入用户名';
    }

    if (!formData.email) {
      newErrors.email = '请输入邮箱';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }

    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '请确认密码';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        result = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setMessage(result.error);
      }
    } catch (error) {
      setMessage('操作失败，请重试');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setMessage('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔮 八字命理排盘系统</h1>
          <p>{isLogin ? '登录您的账户' : '创建新账户'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label>用户名</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                placeholder="请输入用户名"
              />
              {errors.username && (
                <span className="error-message">{errors.username}</span>
              )}
            </div>
          )}

          <div className="input-group">
            <label>邮箱</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="请输入邮箱"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="input-group">
            <label>密码</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="请输入密码"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {!isLogin && (
            <div className="input-group">
              <label>确认密码</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="请再次输入密码"
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {message && (
            <div className="message error-message">{message}</div>
          )}

          <button type="submit" className="btn btn-primary btn-block">
            {isLogin ? '登录' : '注册'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? '还没有账户？' : '已有账户？'}
            <button onClick={toggleMode} className="link-button">
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

