import React, { useMemo, useState } from 'react';
import DateRangePicker from './DateRangePicker';
import GanZhiPicker from './GanZhiPicker';
import './AdvancedFiltersModal.css';

const AdvancedFiltersModal = ({
  show = false,
  value = {},
  onChange,
  onApply,
  onClose,
}) => {
  const v = useMemo(() => ({
    name: '',
    gender: '',
    calendarType: 'gregorian',
    birthYearFrom: '',
    birthYearTo: '',
    birthMonth: '',
    birthDay: '',
    yearGan: '', yearZhi: '',
    monthGan: '', monthZhi: '',
    dayGan: '', dayZhi: '',
    hourGan: '', hourZhi: '',
    ...(value || {})
  }), [value]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGanPicker, setShowGanPicker] = useState({ open: false, pillar: '', type: 'gan' });

  if (!show) return null;

  const openGanPicker = (pillar, type) => setShowGanPicker({ open: true, pillar, type });
  const closeGanPicker = () => setShowGanPicker({ open: false, pillar: '', type: 'gan' });

  const setField = (key, val) => onChange && onChange({ ...v, [key]: val });

  const handleDateConfirm = ({ from, to }) => {
    setField('birthYearFrom', from.year || '');
    setField('birthYearTo', to.year || '');
    // Month/Day为精确过滤（后端为等值匹配），若用户选择月/日则传入
    setField('birthMonth', from.month && to.month && from.month === to.month ? from.month : '');
    setField('birthDay', from.day && to.day && from.day === to.day ? from.day : '');
    setShowDatePicker(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">高级筛选</div>
        <div className="modal-body">
          <div className="row">
            <label>姓名：</label>
            <input className="input" value={v.name} onChange={e => setField('name', e.target.value)} placeholder="按姓名精确过滤" />
          </div>

          <div className="row">
            <label>性别：</label>
            <select className="select" value={v.gender} onChange={e => setField('gender', e.target.value)}>
              <option value="">不限</option>
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div className="row">
            <label>日期：</label>
            <div className="date-controls">
              <button className="btn btn-secondary" onClick={() => setShowDatePicker(true)}>选择起始/结束日期</button>
              <div className="calendar-toggle">
                <label className={v.calendarType === 'gregorian' ? 'active' : ''}>
                  <input type="radio" name="calendarType" checked={v.calendarType === 'gregorian'} onChange={() => setField('calendarType', 'gregorian')} />阳历
                </label>
                <label className={v.calendarType === 'lunar' ? 'active' : ''}>
                  <input type="radio" name="calendarType" checked={v.calendarType === 'lunar'} onChange={() => setField('calendarType', 'lunar')} />农历
                </label>
              </div>
            </div>
            {(v.birthYearFrom || v.birthYearTo || v.birthMonth || v.birthDay) && (
              <div className="date-summary">
                范围：{v.birthYearFrom || '-'} 至 {v.birthYearTo || '-'} {v.birthMonth ? `，月=${v.birthMonth}` : ''} {v.birthDay ? `，日=${v.birthDay}` : ''}
              </div>
            )}
          </div>

          <div className="row pillars">
            <div className="pillar">
              <div className="label">年柱：</div>
              <button className="btn btn-secondary" onClick={() => openGanPicker('year', 'gan')}>{v.yearGan || '天干'}</button>
              <button className="btn btn-secondary" onClick={() => openGanPicker('year', 'zhi')}>{v.yearZhi || '地支'}</button>
            </div>
            <div className="pillar">
              <div className="label">月柱：</div>
              <button className="btn btn-secondary" onClick={() => openGanPicker('month', 'gan')}>{v.monthGan || '天干'}</button>
              <button className="btn btn-secondary" onClick={() => openGanPicker('month', 'zhi')}>{v.monthZhi || '地支'}</button>
            </div>
            <div className="pillar">
              <div className="label">日柱：</div>
              <button className="btn btn-secondary" onClick={() => openGanPicker('day', 'gan')}>{v.dayGan || '天干'}</button>
              <button className="btn btn-secondary" onClick={() => openGanPicker('day', 'zhi')}>{v.dayZhi || '地支'}</button>
            </div>
            <div className="pillar">
              <div className="label">时柱：</div>
              <button className="btn btn-secondary" onClick={() => openGanPicker('hour', 'gan')}>{v.hourGan || '天干'}</button>
              <button className="btn btn-secondary" onClick={() => openGanPicker('hour', 'zhi')}>{v.hourZhi || '地支'}</button>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>关闭</button>
          <button className="btn btn-primary" onClick={onApply}>应用筛选</button>
        </div>
      </div>

      <DateRangePicker
        show={showDatePicker}
        title="选择起始/结束日期"
        calendarType={v.calendarType}
        initial={{
          from: { year: v.birthYearFrom, month: v.birthMonth, day: v.birthDay },
          to: { year: v.birthYearTo, month: v.birthMonth, day: v.birthDay }
        }}
        onConfirm={handleDateConfirm}
        onClose={() => setShowDatePicker(false)}
      />

      <GanZhiPicker
        show={showGanPicker.open}
        type={showGanPicker.type}
        onClose={closeGanPicker}
        onSelect={(item) => {
          const field = `${showGanPicker.pillar}${showGanPicker.type === 'gan' ? 'Gan' : 'Zhi'}`;
          setField(field, item);
          closeGanPicker();
        }}
      />
    </div>
  );
};

export default AdvancedFiltersModal;