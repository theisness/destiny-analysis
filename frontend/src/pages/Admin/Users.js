import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL, DEFAULT_AVATAR } from '../../config';
import SecureImage from '../../components/SecureImage';
import './Users.css';

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.listUsers();
        setUsers(res.data?.users || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || '加载成员列表失败');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => (a.nickname || a.username || '').localeCompare(b.nickname || b.username || ''));
  }, [users]);

  const getAvatarSrc = (u) => (u?.avatarUrl ? `${BASE_URL}${u.avatarUrl}` : DEFAULT_AVATAR);
  const isSelf = (u) => u._id === user?.id;

  const toggleAdmin = async (u) => {
    const makeAdmin = u.admin === 1 ? false : true;
    const ok = window.confirm(`${makeAdmin ? '设置' : '取消'}管理员：${u.nickname || u.username}？`);
    if (!ok) return;
    try {
      await adminAPI.setAdmin(u._id, makeAdmin);
      setUsers(prev => prev.map(x => x._id === u._id ? { ...x, admin: makeAdmin ? 1 : 0 } : x));
    } catch (err) {
      alert(err.response?.data?.message || '操作失败');
    }
  };

  const toggleBan = async (u) => {
    const isBanned = u.isBanned ? false : true;
    const ok = window.confirm(`${isBanned ? '禁用' : '启用'}用户：${u.nickname || u.username}？`);
    if (!ok) return;
    try {
      await adminAPI.banUser(u._id, isBanned);
      setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isBanned } : x));
    } catch (err) {
      alert(err.response?.data?.message || '操作失败');
    }
  };

  const deleteUser = async (u) => {
    const ok = window.confirm(`删除用户：${u.nickname || u.username}？此操作不可恢复。`);
    if (!ok) return;
    try {
      await adminAPI.deleteUser(u._id);
      setUsers(prev => prev.filter(x => x._id !== u._id));
    } catch (err) {
      alert(err.response?.data?.message || '删除失败');
    }
  };

  if (!user?.admin) {
    return (
      <div className="admin-users-page">
        <Navbar />
        <div className="container">
          <div className="error-container">仅管理员可访问成员管理</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <Navbar />
      <div className="container">
        <h1>成员管理</h1>
        {loading ? (
          <div className="loading-container">加载中...</div>
        ) : error ? (
          <div className="error-container">{error}</div>
        ) : (
          <div className="users-list">
            {sortedUsers.map(u => (
              <div key={u._id} className="user-item">
                <div className="main">
                  <SecureImage className="avatar" src={getAvatarSrc(u)} alt="avatar" />
                  <div className="info">
                    <div className="name">{u.nickname || u.username}</div>
                    <div className="sub">{u.admin === 1 ? '管理员' : '成员'} · {u.email}</div>
                  </div>
                </div>
                {!isSelf(u) && (
                  <div className="actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => toggleAdmin(u)}>
                      {u.admin === 1 ? '取消管理员' : '设置为管理员'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => toggleBan(u)}>
                      {u.isBanned ? '启用' : '禁用'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u)}>
                      删除
                    </button>
                  </div>
                )}
              </div>
            ))}
            {sortedUsers.length === 0 && (
              <div className="empty">暂无成员</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;