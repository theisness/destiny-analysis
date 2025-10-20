import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { usersAPI } from '../../api/api';
import { BASE_URL, DEFAULT_AVATAR } from '../../config';
import './UserProfile.css';



const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await usersAPI.getById(id);
        setProfile(res.data.user);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || '加载用户信息失败');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const getAvatarSrc = (u) => (u?.avatarUrl ? `${BASE_URL}${u.avatarUrl}` : DEFAULT_AVATAR);

  return (
    <div className="user-profile-page">
      <Navbar />
      <div className="container">
        <div className="detail-header">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>← 返回</button>
          <h1>用户资料</h1>
        </div>

        {loading ? (
          <div className="loading-container">加载中...</div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>返回</button>
          </div>
        ) : (
          <div className="card user-card">
            <div className="user-main">
              <img className="avatar" src={getAvatarSrc(profile)} alt="avatar" />
              <div className="info">
                <div className="name">{profile.nickname || profile.username}</div>
                <div className="sub">@{profile.username}</div>
              </div>
            </div>
            {profile.gender && (
                <div className="extra-item"><span className="label">性别：</span><span className="value">{profile.gender}</span></div>
              )}
              <br />
              {/* 显示生日 */}
              {profile.birthday && (
                <div className="extra-item"><span className="label">生日：</span><span className="value">{profile.birthday.split('T')[0]}</span></div>
              )}
              <br />
              {/* 显示个人介绍 */}
              {profile.bio && (
                <div className="extra-item"><span className="label">个人介绍：</span><span className="value">{profile.bio}</span></div>
              )}
            <div className="actions">
              <Link to="/community" className="btn btn-secondary">返回社区</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;