import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/Navbar';
import { groupsAPI, usersAPI, userGroupsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL, DEFAULT_AVATAR } from '../../config';
import SecureImage from '../../components/SecureImage';
import './Groups.css';

const AdminGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [creating, setCreating] = useState(false);

  // 成员查看与管理弹窗
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);

  const fetchGroups = async (q = '') => {
    try {
      setLoading(true);
      const res = await groupsAPI.list(q);
      setGroups(res.data?.groups || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || '加载分组失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(''); }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchGroups(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async () => {
    const name = newGroup.trim();
    if (!name) return;
    try {
      setCreating(true);
      await groupsAPI.create(name);
      setNewGroup('');
      await fetchGroups(search.trim());
    } catch (err) {
      alert(err.response?.data?.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (group) => {
    const name = prompt('修改分组名称', group.name)?.trim();
    if (!name) return;
    try {
      await groupsAPI.rename(group._id, name);
      await fetchGroups(search.trim());
    } catch (err) {
      alert(err.response?.data?.message || '重命名失败');
    }
  };

  const handleDelete = async (group) => {
    const ok = window.confirm(`删除分组：${group.name}？删除前需确保无成员在此分组。`);
    if (!ok) return;
    try {
      await groupsAPI.delete(group._id);
      setGroups(prev => prev.filter(g => g._id !== group._id));
    } catch (err) {
      alert(err.response?.data?.message || '删除失败');
    }
  };

  const openMembersModal = async (group) => {
    try {
      setCurrentGroup(group);
      setShowMembersModal(true);
      const res = await groupsAPI.listUsers(group._id);
      setGroupMembers(res.data?.users || []);
    } catch (err) {
      alert(err.response?.data?.message || '加载分组成员失败');
    }
  };

  // 搜索成员以添加到分组
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!memberSearch.trim()) { setMemberSearchResults([]); return; }
      try {
        const res = await usersAPI.search(memberSearch.trim());
        setMemberSearchResults(res.data?.users || []);
      } catch (e) {
        setMemberSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [memberSearch]);

  const addMemberToGroup = async (u) => {
    if (!currentGroup) return;
    try {
      await userGroupsAPI.joinGroup(u._id, currentGroup._id);
      setGroupMembers(prev => prev.find(x => x._id === u._id) ? prev : [...prev, u]);
    } catch (err) {
      alert(err.response?.data?.message || '添加成员失败');
    }
  };

  const removeMemberFromGroup = async (u) => {
    if (!currentGroup) return;
    try {
      await userGroupsAPI.leaveGroup(u._id, currentGroup._id);
      setGroupMembers(prev => prev.filter(x => x._id !== u._id));
    } catch (err) {
      alert(err.response?.data?.message || '移出成员失败');
    }
  };

  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [groups]);

  if (!user?.admin) {
    return (
      <div className="admin-groups-page">
        <Navbar />
        <div className="container">
          <div className="error-container">仅管理员可访问分组管理</div>
        </div>
      </div>
    );
  }

  const getAvatarSrc = (u) => (u?.avatarUrl ? `${BASE_URL}${u.avatarUrl}` : DEFAULT_AVATAR);

  return (
    <div className="admin-groups-page">
      <Navbar />
      <div className="container">
        <h1>分组管理</h1>

        <div className="card">
          <h2>新增分组</h2>
          <div className="form-inline">
            <input
              className="input"
              type="text"
              placeholder="输入分组名"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); handleCreate(); } }}
            />
            <button className="btn btn-primary" disabled={creating} onClick={handleCreate}>创建</button>
          </div>
        </div>

        <div className="card">
          <h2>搜索与列表</h2>
          <div className="form-inline">
            <input
              className="input"
              type="text"
              placeholder="搜索分组"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading-container">加载中...</div>
          ) : error ? (
            <div className="error-container">{error}</div>
          ) : (
            <div className="groups-list">
              {sortedGroups.length === 0 ? (
                <div className="empty">暂无分组</div>
              ) : (
                sortedGroups.map(group => (
                  <div key={group._id} className="group-item">
                    <span className="group-name">{group.name}</span>
                    <div className="actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openMembersModal(group)}>查看成员</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleRename(group)}>修改名称</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(group)}>删除</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showMembersModal && currentGroup && (
        <div className="modal-backdrop" onClick={() => setShowMembersModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>分组成员 · {currentGroup.name}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowMembersModal(false)}>关闭</button>
            </div>
            <div className="modal-content">
              <div className="member-search">
                <input
                  className="input"
                  type="text"
                  placeholder="搜索用户（输入用户名关键词）"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
                {memberSearchResults.length > 0 && (
                  <div className="search-results">
                    {memberSearchResults.map(u => (
                      <div key={u._id} className="result-item">
                        <SecureImage className="avatar" src={getAvatarSrc(u)} alt="" />
                        <div className="info">
                          <div className="name">{u.nickname || u.username}</div>
                          <div className="sub">@{u.username}</div>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={() => addMemberToGroup(u)}>添加</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="members-list">
                {groupMembers.length === 0 ? (
                  <div className="empty">暂无成员</div>
                ) : (
                  groupMembers.map(u => (
                    <div key={u._id} className="member-item">
                      <SecureImage className="avatar" src={getAvatarSrc(u)} alt="" />
                      <div className="info">
                        <div className="name">{u.nickname || u.username}</div>
                        <div className="sub">@{u.username}</div>
                      </div>
                      <button className="btn btn-danger btn-sm" onClick={() => removeMemberFromGroup(u)}>移出</button>
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

export default AdminGroups;