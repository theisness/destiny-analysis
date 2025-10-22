import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/Navbar';
import { adminAPI, groupsAPI, userGroupsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL, DEFAULT_AVATAR } from '../../config';
import SecureImage from '../../components/SecureImage';
import './Users.css';
import './Groups.css';

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 分组管理相关状态
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [groupSearch, setGroupSearch] = useState('');
  const [groupResults, setGroupResults] = useState([]);

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

  // 搜索分组以添加给成员
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        if (!groupSearch.trim()) {
          const res = await groupsAPI.list();
          setGroupResults(res.data?.groups || []);
        } else {
          const res = await groupsAPI.list(groupSearch.trim());
          setGroupResults(res.data?.groups || []);
        }
      } catch (e) {
        setGroupResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [groupSearch]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => (a.nickname || a.username || '').localeCompare(b.nickname || b.username || ''));
  }, [users]);

  const getAvatarSrc = (u) => (u?.avatarUrl ? `${BASE_URL}${u.avatarUrl}` : DEFAULT_AVATAR);
  const isSelf = (u) => u._id === user?.id;

  // 分组管理弹窗逻辑
  const openGroupModal = async (u) => {
    try {
      setTargetUser(u);
      setShowGroupModal(true);
      const resUG = await userGroupsAPI.getUserGroups(u._id);
      setUserGroups(resUG.data?.groups || []);
      const resG = await groupsAPI.list();
      setGroupResults(resG.data?.groups || []);
    } catch (err) {
      alert(err.response?.data?.message || '加载分组信息失败');
    }
  };

  const addGroupToUser = async (group) => {
    try {
      await userGroupsAPI.joinGroup(targetUser._id, group._id);
      setUserGroups(prev => prev.some(g => g._id === group._id) ? prev : [...prev, group]);
    } catch (err) {
      alert(err.response?.data?.message || '添加分组失败');
    }
  };

  const removeGroupFromUser = async (group) => {
    try {
      await userGroupsAPI.leaveGroup(targetUser._id, group._id);
      setUserGroups(prev => prev.filter(g => g._id !== group._id));
    } catch (err) {
      alert(err.response?.data?.message || '移出分组失败');
    }
  };

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
                <div className="actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openGroupModal(u)}>分组管理</button>
                  {!isSelf(u) && (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => toggleAdmin(u)}>
                        {u.admin === 1 ? '取消管理员' : '设置为管理员'}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => toggleBan(u)}>
                        {u.isBanned ? '启用' : '禁用'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u)}>
                        删除
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {sortedUsers.length === 0 && (
              <div className="empty">暂无成员</div>
            )}
          </div>
        )}
      </div>

      {showGroupModal && targetUser && (
        <div className="modal-backdrop" onClick={() => setShowGroupModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>成员分组 · {targetUser.nickname || targetUser.username}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowGroupModal(false)}>关闭</button>
            </div>
            <div className="modal-content">
              <div className="member-search">
                <input
                  className="input"
                  type="text"
                  placeholder="搜索分组（输入分组名关键词）"
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                />
                {groupResults.length > 0 && (
                  <div className="search-results">
                    {groupResults.map(g =>
                      (
                        // 过滤掉已加入的成员
                        !userGroups.find(x => x._id === g._id) && (
                          <div key={g._id} className="result-item">
                            <div className="info">
                              <div className="name">{g.name}</div>
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={() => addGroupToUser(g)}>添加</button>
                          </div>
                        )
                    ))}
                  </div>
                )}
              </div>

              <div className="members-list">
                {userGroups.length === 0 ? (
                  <div className="empty">该用户暂无分组</div>
                ) : (
                  userGroups.map(g => (
                    <div key={g._id} className="member-item">
                      <div className="info">
                        <div className="name">{g.name}</div>
                      </div>
                      <button className="btn btn-danger btn-sm" onClick={() => removeGroupFromUser(g)}>移出</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;