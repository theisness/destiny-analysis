import React, { useEffect, useMemo, useState } from 'react';
import { baziAPI, usersAPI } from '../api/api';
import './ShareSettingsSection.css';
import { DEFAULT_AVATAR } from '../config';
import SecureImage from '../components/SecureImage';

const ShareSettingsSection = ({ record, onUpdated }) => {
  const [addToCommunity, setAddToCommunity] = useState(!!record.addToCommunity);
  const [type, setType] = useState(record.shareSettings?.type || 'public');
  const [allowedUsers, setAllowedUsers] = useState([]); // [{_id, username, nickname, avatarUrl}]
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showPublicConfirm, setShowPublicConfirm] = useState(false);
  const [ackRisk, setAckRisk] = useState(false);

  // 初始化受限名单详情
  useEffect(() => {
    const init = async () => {
      const ids = record.shareSettings?.allowedUserIds || [];
      // 拉取每个用户的公开信息
      const list = [];
      for (const id of ids) {
        try {
          const res = await usersAPI.getById(id);
          if (res.data?.user) list.push(res.data.user);
        } catch {}
      }
      setAllowedUsers(list);
    };
    if (type === 'restricted') {
      init();
    } else {
      setAllowedUsers([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record._id]);

  // 搜索用户
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!search.trim()) { setSearchResults([]); return; }
      try {
        const res = await usersAPI.search(search.trim());
        setSearchResults(res.data?.users || []);
      } catch (e) {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const addUser = (u) => {
    if (allowedUsers.find(x => x._id === u._id)) return;
    setAllowedUsers(prev => [...prev, u]);
  };
  const removeUser = (id) => {
    setAllowedUsers(prev => prev.filter(u => u._id !== id));
  };

  const handleSelectType = (nextType) => {
    if (nextType === 'public') {
      setShowPublicConfirm(true);
    } else {
      setType('restricted');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      const payload = {
        addToCommunity,
        shareSettings: addToCommunity ? {
          type,
          allowedUserIds: type === 'restricted' ? allowedUsers.map(u => u._id) : []
        } : undefined
      };
      const res = await baziAPI.update(record._id, payload);
      setMessage('已保存分享设置');
      onUpdated && onUpdated(res.data?.data || {});
    } catch (err) {
      setMessage(err.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2>分享设置</h2>
      <div className="share-grid">
        <label className="row">
          <input className="styled-checkbox" type="checkbox" checked={addToCommunity} onChange={(e) => setAddToCommunity(e.target.checked)} />
          <span>加入社区展示</span>
        </label>
        {addToCommunity && (
          <div className="row">
            <label className={"radio"}>
              <input type="radio" name="shareType" checked={type === 'public'} onChange={() => handleSelectType('public')} /> 公开（所有人可见）
            </label>
            <label className={"radio"}>
              <input type="radio" name="shareType" checked={type === 'restricted'} onChange={() => handleSelectType('restricted')} /> 受限（仅名单可见）
            </label>
          </div>
        )}

        {addToCommunity && type === 'public' && (
          <div className="privacy-warning">
            <div className="privacy-warning-title">隐私安全提醒</div>
            <div className="privacy-warning-text">
              公开后，任何人登录的成员都可查看此八字记录。请勿包含身份证号、手机号、住址等敏感信息；你可以随时改为“受限”或取消加入社区。
            </div>
          </div>
        )}

        {addToCommunity && type === 'restricted' && (
          <div className="restricted-block">
            <div className="input-group">
              <label>添加可见的用户</label>
              <input placeholder="输入用户名关键词搜索" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(u => (
                  <div key={u._id} className="result-item" onClick={() => addUser(u)}>
                    <SecureImage className="avatar" src={u.avatarUrl ? (process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}${u.avatarUrl}` : `http://localhost:5000/api/${u.avatarUrl}`) : DEFAULT_AVATAR} alt="" />
                    <div className="info">
                      <div className="name">{u.nickname || u.username}</div>
                      <div className="sub">@{u.username}</div>
                    </div>
                    <button className="btn btn-secondary btn-sm">添加</button>
                  </div>
                ))}
              </div>
            )}

            <div className="chips">
              {allowedUsers.map(u => (
                <div key={u._id} className="chip">
                  <span>{u.nickname || u.username}</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => removeUser(u._id)}>移除</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {message && <div className="message">{message}</div>}
        <div className="actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>保存设置</button>
        </div>

        {showPublicConfirm && (
          <div className="modal-privacy-mask" onClick={() => setShowPublicConfirm(false)}>
            <div className="modal-privacy" onClick={(e) => e.stopPropagation()}>
              <div className="modal-privacy-header">公开分享隐私提醒</div>
              <div className="modal-privacy-body">
                <p>公开后，任何人都可以查看您的八字记录及基本信息。</p>
                <p>请确认已移除或避免包含敏感信息（如身份证号、手机号、住址等）。</p>
                <label className="ack-row">
                  <input type="checkbox" checked={ackRisk} onChange={(e) => setAckRisk(e.target.checked)} />
                  <span>我已知悉风险并愿意公开此记录</span>
                </label>
              </div>
              <div className="modal-privacy-actions">
                <button className="btn btn-secondary" onClick={() => { setShowPublicConfirm(false); setAckRisk(false); }}>取消</button>
                <button className="btn btn-primary" disabled={!ackRisk} onClick={() => { setType('public'); setShowPublicConfirm(false); }}>继续公开</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareSettingsSection;