import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import { captchaAPI } from '../../api/api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [sendCountdown, setSendCountdown] = useState(0);
  const [resetMsg, setResetMsg] = useState('');
  useEffect(() => {
    if (sendCountdown <= 0) return;
    const t = setTimeout(() => setSendCountdown(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [sendCountdown]);
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
      if (!formData.inviteCode) {
        newErrors.inviteCode = '请输入邀请码';
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
          password: formData.password,
          inviteCode: formData.inviteCode
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
    setShowReset(false);
    setResetEmail('');
    setResetCode('');
    setSendCountdown(0);
    setResetMsg('');
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const handleSendCode = async () => {
    if (!emailRegex.test(resetEmail.trim())) { setResetMsg('请输入有效的邮箱'); return; }
    try {
      setResetMsg('');
      const res = await captchaAPI.send(resetEmail.trim());
      setResetMsg(res.data?.message || '验证码已发送，请查收邮件');
      setSendCountdown(60);
    } catch (err) {
      setResetMsg(err.response?.data?.message || '发送验证码失败');
    }
  };
  const handleVerifyCode = async () => {
    if (!emailRegex.test(resetEmail.trim())) { setResetMsg('请输入有效的邮箱'); return; }
    if (!resetCode.trim()) { setResetMsg('请输入验证码'); return; }
    try {
      setResetMsg('');
      const res = await captchaAPI.verify(resetEmail.trim(), resetCode.trim());
      setResetMsg(res.data?.message || '验证码验证通过');
    } catch (err) {
      setResetMsg(err.response?.data?.message || '验证码验证失败');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>☯ 八字命理排盘系统</h1>
          <p>{isLogin ? '登录您的账户' : '创建新账户'}</p>
        </div>

        {isLogin && (
          <div className="reset-card">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReset(v => !v)}>
              {showReset ? '收起重置密码' : '重置密码'}
            </button>
            {showReset && (
              <div className="reset-section">
                <div className="input-group">
                  <label>邮箱</label>
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="请输入邮箱" />
                </div>
                <div className="actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleSendCode} disabled={sendCountdown > 0}>
                    {sendCountdown > 0 ? `再次发送（${sendCountdown}s）` : '发送验证码'}
                  </button>
                </div>
                <div className="input-group">
                  <label>验证码</label>
                  <input type="text" value={resetCode} onChange={(e) => setResetCode(e.target.value)} placeholder="请输入6位验证码" />
                </div>
                <div className="actions">
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleVerifyCode}>验证验证码</button>
                </div>
                {resetMsg && <div className="message">{resetMsg}</div>}
              </div>
            )}
          </div>
        )}

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
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="请输入密码"
              />
              <button type="button" className="toggle-visibility" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? '隐藏' : '显示'}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {!isLogin && (
            <div className="input-group">
              <label>确认密码</label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="请再次输入密码"
                />
                <button type="button" className="toggle-visibility" onClick={() => setShowConfirmPassword(v => !v)}>
                  {showConfirmPassword ? '隐藏' : '显示'}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {!isLogin && (
            <div className="input-group">
              <label>邀请码</label>
              <input
                type="text"
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleChange}
                className={errors.inviteCode ? 'error' : ''}
                placeholder="请输入邀请码"
              />
              {errors.inviteCode && (
                <span className="error-message">{errors.inviteCode}</span>
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

