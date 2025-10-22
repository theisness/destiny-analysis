import React, { useMemo, useState } from 'react';
import './DateRangePicker.css';

const years = Array.from({ length: 201 }, (_, i) => 1900 + i); // 1900 - 2100
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

const DateSelect = ({ value, onChange }) => {
  const v = useMemo(() => ({ year: '', month: '', day: '', ...(value || {}) }), [value]);
  return (
    <div className="date-select">
      <select className="select" value={v.year} onChange={e => onChange({ ...v, year: e.target.value })}>
        <option value="">年</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <select className="select" value={v.month} onChange={e => onChange({ ...v, month: e.target.value })}>
        <option value="">月</option>
        {months.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select className="select" value={v.day} onChange={e => onChange({ ...v, day: e.target.value })}>
        <option value="">日</option>
        {days.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
    </div>
  );
};

const DateRangePicker = ({ show = false, title = '选择日期', calendarType = 'gregorian', initial = {}, onConfirm, onClose }) => {
  const [from, setFrom] = useState(initial.from || {});
  const [to, setTo] = useState(initial.to || {});
  if (!show) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">{title}（{calendarType === 'lunar' ? '农历' : '阳历'}）</div>
        <div className="date-range-body">
          <div className="date-row">
            <label>起始：</label>
            <DateSelect value={from} onChange={setFrom} />
          </div>
          <div className="date-row">
            <label>结束：</label>
            <DateSelect value={to} onChange={setTo} />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={() => onConfirm && onConfirm({ from, to })}>确定</button>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;