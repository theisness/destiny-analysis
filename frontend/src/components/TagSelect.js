import React, { useEffect, useMemo, useRef, useState } from 'react';
import { labelsAPI } from '../api/api';
import './TagSelect.css';

const TagSelect = ({ value = [], onChange, placeholder = '输入标签，按回车添加', allowFreeText = true }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(Array.isArray(value) ? value : []);
  const timerRef = useRef(null);

  useEffect(() => {
    setSelected(Array.isArray(value) ? value : []);
  }, [value]);

  const fetchSuggestions = async (q) => {
    try {
      const res = await labelsAPI.list(q || '');
      const names = (res.data?.labels || []).map(l => l.name);
      setSuggestions(names);
    } catch (e) {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    // 初次加载
    fetchSuggestions('');
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(query), 200);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [query]);

  const addTag = (name) => {
    const n = String(name || '').trim();
    if (!n) return;
    if (selected.includes(n)) return;
    const next = [...selected, n];
    setSelected(next);
    onChange && onChange(next);
    setQuery('');
    setOpen(false);
  };

  const removeTag = (name) => {
    const next = selected.filter(t => t !== name);
    setSelected(next);
    onChange && onChange(next);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suggestions.filter(s => !selected.includes(s) && (!q || s.toLowerCase().includes(q)));
  }, [suggestions, selected, query]);

  return (
    <div className="tag-select">
      <div className="selected">
        {selected.map((t) => (
          <span className="tag-chip" key={t}>
            {t}
            <button type="button" className="remove" onClick={() => removeTag(t)}>×</button>
          </span>
        ))}
      </div>
      <div className="input-row">
        <input
          className="tag-input"
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              if (allowFreeText) addTag(query);
              else if (filtered.length > 0) addTag(filtered[0]);
            }
          }}
        />
        {open && filtered.length > 0 && (
          <div className="suggestions">
            {filtered.map((s) => (
              <div className="suggestion-item" key={s} onMouseDown={() => addTag(s)}>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelect;