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
    birthMonthFrom: '',
    birthMonthTo: '',
    birthDayFrom: '',
    birthDayTo: '',
    yearGan: '', yearZhi: '',
    monthGan: '', monthZhi: '',
    dayGan: '', dayZhi: '',
    hourGan: '', hourZhi: '',
    ...(value || {})
  }), [value]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  // 使用v中状态
  const [chosenRange, setChosenRange] = useState( { from: { year: v.birthYearFrom, month: v.birthMonthFrom, day: v.birthDayFrom }, to: { year: v.birthYearTo, month: v.birthMonthTo, day: v.birthDayTo } }); 
  const [showGanPicker, setShowGanPicker] = useState({ open: false, pillar: '', type: 'gan' });

  if (!show) return null;

  const openGanPicker = (pillar, type) => setShowGanPicker({ open: true, pillar, type });
  const closeGanPicker = () => setShowGanPicker({ open: false, pillar: '', type: 'gan' });

  const setField = (key, val) => onChange && onChange({ ...v, [key]: val });
  const clearPillar = (pillar) => {
    if (!onChange) return;
    const next = { ...v, [`${pillar}Gan`]: '', [`${pillar}Zhi`]: '' };
    onChange(next);
  };
  console.log('clearDate', v);
  const clearDate = () =>{
    setChosenRange({ from: { year: '', month: '', day: '' }, to: { year: '', month: '', day: '' } });
    if(onChange){
      const next = {
        ...v,
        birthYearFrom: '',
        birthYearTo: '',
        birthMonthFrom: '',
        birthMonthTo: '',
        birthDayFrom: '',
        birthDayTo: '',
      };
      onChange(next);
    } 
  }

  const formatDate = (d = {}) => {
    const y = d.year ? String(d.year) : '';
    const m = d.month ? String(d.month).padStart(2, '0') : '';
    const day = d.day ? String(d.day).padStart(2, '0') : '';
    const res = [y, m, day].filter(Boolean).join('-');
    return res || '-';
  };

  const handleDateConfirm = ({ from, to }) => {
    setChosenRange({ from, to });
    if (!onChange) { setShowDatePicker(false); return; }
    const next = {
      ...v,
      birthYearFrom: from.year || '',
      birthYearTo: to.year || '',
      birthMonthFrom: from.month || '',
      birthMonthTo: to.month || '',
      birthDayFrom: from.day || '',
      birthDayTo: to.day || '' 
    };
    onChange(next);
    setShowDatePicker(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
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
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>

          <div className="row">
            <label>日期：</label>
            <div className="date-controls">
              <button className="btn btn-secondary" onClick={() => setShowDatePicker(true)}>选择起始/结束日期</button>
              &nbsp;<button className="btn btn-secondary btn-clear" onClick={clearDate}>清除</button>
              <div className="calendar-toggle">
                <label className={v.calendarType === 'gregorian' ? 'active' : ''}>
                  <input type="radio" name="calendarType" checked={v.calendarType === 'gregorian'} onChange={() => setField('calendarType', 'gregorian')} />阳历
                </label>
                <label className={v.calendarType === 'lunar' ? 'active' : ''}>
                  <input type="radio" name="calendarType" checked={v.calendarType === 'lunar'} onChange={() => setField('calendarType', 'lunar')} />农历
                </label>
              </div>
            </div>
            {(chosenRange.from.year || chosenRange.to.year || chosenRange.from.month || chosenRange.to.month || chosenRange.from.day || chosenRange.to.day) && (
              <div className="date-summary">
                已选范围：{formatDate(chosenRange.from)} 至 {formatDate(chosenRange.to)}（{v.calendarType === 'lunar' ? '农历' : '阳历'}）
              </div>
            )}
          </div>

          <div className="row pillars">
            <div className="pillar">
              <div className="label">年柱：</div>
              <div className="pillar-controls">
                <button className="btn btn-secondary" onClick={() => openGanPicker('year', 'gan')}>{v.yearGan || '天干'}</button>
                <button className="btn btn-secondary" onClick={() => openGanPicker('year', 'zhi')}>{v.yearZhi || '地支'}</button>
                <button className="btn btn-secondary btn-clear" onClick={() => clearPillar('year')}>清除</button>
              </div>
            </div>
            <div className="pillar">
              <div className="label">月柱：</div>
              <div className="pillar-controls">
                <button className="btn btn-secondary" onClick={() => openGanPicker('month', 'gan')}>{v.monthGan || '天干'}</button>
                <button className="btn btn-secondary" onClick={() => openGanPicker('month', 'zhi')}>{v.monthZhi || '地支'}</button>
                <button className="btn btn-secondary btn-clear" onClick={() => clearPillar('month')}>清除</button>
              </div>
            </div>
            <div className="pillar">
              <div className="label">日柱：</div>
              <div className="pillar-controls">
                <button className="btn btn-secondary" onClick={() => openGanPicker('day', 'gan')}>{v.dayGan || '天干'}</button>
                <button className="btn btn-secondary" onClick={() => openGanPicker('day', 'zhi')}>{v.dayZhi || '地支'}</button>
                <button className="btn btn-secondary btn-clear" onClick={() => clearPillar('day')}>清除</button>
              </div>
            </div>
            <div className="pillar">
              <div className="label">时柱：</div>
              <div className="pillar-controls">
                <button className="btn btn-secondary" onClick={() => openGanPicker('hour', 'gan')}>{v.hourGan || '天干'}</button>
                <button className="btn btn-secondary" onClick={() => openGanPicker('hour', 'zhi')}>{v.hourZhi || '地支'}</button>
                <button className="btn btn-secondary btn-clear" onClick={() => clearPillar('hour')}>清除</button>
              </div>
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