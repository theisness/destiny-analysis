import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { authAPI, uploadAPI } from '../../api/api';
import './Profile.css';

const BASE_URL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api','') : 'http://localhost:5000';
const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#764ba2"/></linearGradient></defs><circle cx="32" cy="32" r="32" fill="url(#g)"/><circle cx="32" cy="26" r="12" fill="white" opacity="0.9"/><path d="M14 54c4-10 14-14 18-14s14 4 18 14" fill="white" opacity="0.9"/></svg>';

const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    avatarUrl: user?.avatarUrl || '',
    nickname: user?.nickname || '',
    gender: user?.gender || '保密',
    birthday: user?.birthday ? user.birthday.substring(0, 10) : '',
    birthdayPrivate: user?.birthdayPrivate || false,
    bio: user?.bio || ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const res = await uploadAPI.uploadFiles(files.slice(0, 1));
      if (res.data?.files?.length) {
        setForm(prev => ({ ...prev, avatarUrl: res.data.files[0].url }));
      }
    } catch (err) {
      setMessage('头像上传失败');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      const payload = { ...form };
      if (!payload.birthday) delete payload.birthday;
      const res = await authAPI.updateProfile(payload);
      setMessage('保存成功');
    } catch (err) {
      setMessage(err.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <Navbar />
      <div className="container">
        <h1>个人信息设置</h1>
        <div className="profile-card">
          <div className="avatar-section">
            <div className="avatar-preview">
              <img src={form.avatarUrl ? `${BASE_URL}${form.avatarUrl}` : DEFAULT_AVATAR} alt="avatar" />
            </div>
            <div className="avatar-actions">
              <label className="btn btn-secondary btn-sm file-label">
                更换头像
                <input type="file" accept="image/*" onChange={handleUpload} />
              </label>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label>昵称</label>
              <input name="nickname" value={form.nickname} onChange={handleChange} placeholder="请输入昵称" />
            </div>
            <div className="input-group">
              <label>性别</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="男">男</option>
                <option value="女">女</option>
                <option value="保密">保密</option>
              </select>
            </div>
            <div className="input-group">
              <label>生日</label>
              <input type="date" name="birthday" value={form.birthday} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input className="styled-checkbox" type="checkbox" name="birthdayPrivate" checked={form.birthdayPrivate} onChange={handleChange} /> 生日对他人隐藏
              </label>
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>个性签名</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="填写你的简介" />
            </div>
          </div>

          {message && <div className="message">{message}</div>}
          <div className="actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>保存</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;