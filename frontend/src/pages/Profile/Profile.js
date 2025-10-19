import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { authAPI, uploadAPI } from '../../api/api';
import './Profile.css';

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
              {form.avatarUrl ? (
                <img src={process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL.replace('/api','')}${form.avatarUrl}` : `http://localhost:5000${form.avatarUrl}`} alt="avatar" />
              ) : (
                <div className="avatar-placeholder">无头像</div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleUpload} />
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
                <input type="checkbox" name="birthdayPrivate" checked={form.birthdayPrivate} onChange={handleChange} /> 生日对他人隐藏
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