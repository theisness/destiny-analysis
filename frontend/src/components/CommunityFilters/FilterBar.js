import React, { useEffect, useMemo, useRef, useState } from 'react';
import TagSelect from '../../components/TagSelect';
import { usersAPI } from '../../api/api';
import './FilterBar.css';

/**
 * FilterBar
 * - 标签筛选（TagSelect）
 * - 分享类型切换：公开 / 限制（分享给我） / 全部
 * - 发布者筛选：输入关键词搜索用户并选择
 * - 高级筛选按钮、应用、清除
 */
const FilterBar = ({
  labels = [],
  onChangeLabels,
  share = '',
  onChangeShare,
  publisherId = '',
  onChangePublisherId,
  onOpenAdvanced,
  onApply,
  onClear
}) => {
  const [publisherQuery, setPublisherQuery] = useState('');
  const [publisherSuggestions, setPublisherSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSuggest, setOpenSuggest] = useState(false);
  const timerRef = useRef(null);

  const selectedPublisher = useMemo(() => publisherSuggestions.find(u => String(u._id) === String(publisherId)) || null, [publisherSuggestions, publisherId]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const q = publisherQuery.trim();
      if (!q) { setPublisherSuggestions([]); return; }
      try {
        setLoading(true);
        const res = await usersAPI.search(q);
        setPublisherSuggestions(res.data?.users || []);
      } catch (e) {
        setPublisherSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [publisherQuery]);

  return (
    <div className="filters-bar">
      <TagSelect value={labels} onChange={onChangeLabels} placeholder="选择标签筛选" allowFreeText={false} />

      <select className="select" value={share} onChange={(e) => onChangeShare && onChangeShare(e.target.value)}>
        <option value="">全部分享</option>
        <option value="public">公开分享</option>
        <option value="restricted">限制分享（分享给我）</option>
      </select>

      <div className="publisher-filter">
        {publisherId ? (
          <div className="publisher-selected">
            <span className="publisher-name">{selectedPublisher?.nickname || selectedPublisher?.username || publisherId}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { onChangePublisherId && onChangePublisherId(''); setPublisherQuery(''); setPublisherSuggestions([]); }}>清除发布者</button>
          </div>
        ) : (
          <div className="publisher-input-group">
            <input
              className="input"
              placeholder="按发布者筛选"
              value={publisherQuery}
              onChange={(e) => { setPublisherQuery(e.target.value); setOpenSuggest(true); }}
              onFocus={() => setOpenSuggest(true)}
              onBlur={() => setTimeout(() => setOpenSuggest(false), 150)}
            />
            {openSuggest && (publisherSuggestions.length > 0 || loading) && (
              <div className="publisher-suggestions">
                {loading && <div className="suggestion-item">搜索中…</div>}
                {!loading && publisherSuggestions.map(u => (
                  <div key={u._id} className="suggestion-item" onMouseDown={() => { onChangePublisherId && onChangePublisherId(u._id); setOpenSuggest(false); }}>
                    <span className="name">{u.nickname || u.username}</span>
                    <span className="sub">@{u.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button className="btn btn-secondary" onClick={onOpenAdvanced}>高级筛选</button>
      <button className="btn btn-primary" onClick={onApply}>应用筛选</button>
      <button className="btn btn-secondary" onClick={onClear}>清除</button>
    </div>
  );
};

export default FilterBar;