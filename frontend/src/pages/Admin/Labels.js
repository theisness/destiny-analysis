import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/Navbar';
import { labelsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './Labels.css';

const AdminLabels = () => {
  const { user } = useAuth();
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchLabels = async (q = '') => {
    try {
      setLoading(true);
      const res = await labelsAPI.list(q);
      setLabels(res.data?.labels || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || '加载标签失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels('');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchLabels(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async () => {
    const name = newLabel.trim();
    if (!name) return;
    try {
      setCreating(true);
      await labelsAPI.create(name);
      setNewLabel('');
      await fetchLabels(search.trim());
    } catch (err) {
      alert(err.response?.data?.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (label) => {
    const ok = window.confirm(`删除标签：${label.name}？`);
    if (!ok) return;
    try {
      await labelsAPI.delete(label._id);
      setLabels(prev => prev.filter(l => l._id !== label._id));
    } catch (err) {
      alert(err.response?.data?.message || '删除失败');
    }
  };

  const sortedLabels = useMemo(() => {
    return [...labels].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [labels]);

  if (!user?.admin) {
    return (
      <div className="admin-labels-page">
        <Navbar />
        <div className="container">
          <div className="error-container">仅管理员可访问标签管理</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-labels-page">
      <Navbar />
      <div className="container">
        <h1>标签管理</h1>

        <div className="card">
          <h2>新增标签</h2>
          <div className="form-inline">
            <input
              className="input"
              type="text"
              placeholder="输入标签名"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
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
              placeholder="搜索标签（支持拼音）"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={() => fetchLabels(search.trim())}>刷新</button>
          </div>

          {loading ? (
            <div className="loading-container">加载中...</div>
          ) : error ? (
            <div className="error-container">{error}</div>
          ) : (
            <div className="labels-list">
              {sortedLabels.length === 0 ? (
                <div className="empty">暂无标签</div>
              ) : (
                sortedLabels.map(label => (
                  <div key={label._id} className="label-item">
                    <span className="label-name">{label.name}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(label)}>删除</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLabels;