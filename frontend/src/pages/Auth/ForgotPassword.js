import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import { captchaAPI, authAPI } from '../../api/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sendCountdown, setSendCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sendCountdown <= 0) return;
    const t = setTimeout(() => setSendCountdown(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [sendCountdown]);

  const validate = () => {
    const nextErrors = {};
    if (!email) nextErrors.email = '请输入邮箱';
    else if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = '请输入有效的邮箱地址';

    if (!newPassword) nextErrors.newPassword = '请输入新密码';
    else if (newPassword.length < 6) nextErrors.newPassword = '密码至少需要6个字符';

    if (!confirmPassword) nextErrors.confirmPassword = '请确认新密码';
    else if (confirmPassword !== newPassword) nextErrors.confirmPassword = '两次输入的密码不一致';

    if (sent) {
      if (!code) nextErrors.code = '请输入验证码';
      else if (!/^\d{6}$/.test(code)) nextErrors.code = '请输入6位数字验证码';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAction = async () => {
    setMessage('');
    if (!sent) {
      // 第一步：发送验证码
      if (!validate()) return;
      try {
        setLoading(true);
        const res = await captchaAPI.send(email.trim());
        setMessage(res.data?.message || '验证码已发送，请查收邮件');
        setSent(true);
        setSendCountdown(60);
      } catch (err) {
        setMessage(err.response?.data?.message || '发送验证码失败');
      } finally {
        setLoading(false);
      }
    } else {
      // 第二步：立即修改（提交新密码和验证码）
      if (!validate()) return;
      try {
        setLoading(true);
        const res = await authAPI.resetPassword(email.trim(), code.trim(), newPassword);
        setMessage(res.data?.message || '密码已重置');
        setTimeout(() => navigate('/auth'), 800);
      } catch (err) {
        setMessage(err.response?.data?.message || '重置失败，请检查验证码');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>☯ 忘记密码</h1>
          <p>通过邮箱验证码重置密码</p>
        </div>

        <div className="auth-form">
          <div className="input-group">
            <label>邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? 'error' : ''} placeholder="请输入邮箱" />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label>新密码</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={errors.newPassword ? 'error' : ''} placeholder="请输入新密码" />
            {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
          </div>

          <div className="input-group">
            <label>确认新密码</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={errors.confirmPassword ? 'error' : ''} placeholder="请再次输入新密码" />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="input-group">
            <label>验证码</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className={errors.code ? 'error' : ''} placeholder="请输入6位验证码" />
            {errors.code && <span className="error-message">{errors.code}</span>}
          </div>

          {message && <div className="message">{message}</div>}

          <button type="button" className="btn btn-primary btn-block" onClick={handleAction} disabled={loading || (!sent && sendCountdown > 0)}>
            {!sent ? (sendCountdown > 0 ? `发送验证码（${sendCountdown}s）` : '发送验证码') : '立即修改'}
          </button>
        </div>

        <div className="auth-footer">
          <div className="footer-actions">
            <Link to="/auth" className="link-button">返回登录</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;