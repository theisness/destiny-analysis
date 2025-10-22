import React from 'react';
import './GanZhiPicker.css';

const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

const GanZhiPicker = ({ type = 'gan', show = false, onSelect, onClose }) => {
  if (!show) return null;
  const list = type === 'zhi' ? ZHI : GAN;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">选择{type === 'zhi' ? '地支' : '天干'}</div>
        <div className="ganzhi-grid">
          {list.map(item => (
            <button key={item} className="ganzhi-btn" onClick={() => onSelect && onSelect(item)}>{item}</button>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
};

export default GanZhiPicker;