import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { baziAPI } from '../../api/api';
import './BaziInput.css';

const BaziInput = () => {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState('gregorian');
  const [formData, setFormData] = useState({
    name: '',
    gender: '男',
    addToCommunity: false
  });
  const [gregorianDate, setGregorianDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    hour: 12,
    minute: 0
  });
  const [lunarDate, setLunarDate] = useState({
    year: new Date().getFullYear(),
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    isLeapMonth: false
  });
  const [sizhu, setSizhu] = useState({
    year: '甲子',
    month: '甲子',
    day: '甲子',
    hour: '甲子'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSizhuModal, setShowSizhuModal] = useState(false);
  const [showDateSelectModal, setShowDateSelectModal] = useState(false);
  const [possibleDates, setPossibleDates] = useState([]);

  const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // 计算可能的日期范围
  const calculatePossibleDates = async () => {
    try {
      setLoading(true);
      
      // 调用后端 API 根据四柱反推日期
      const response = await fetch('/api/bazi/reverse-calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sizhu: sizhu
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPossibleDates(data.dates || []);
        setShowDateSelectModal(true);
      } else {
        // 如果后端 API 不可用，使用前端简化计算
        calculatePossibleDatesLocal();
      }
    } catch (error) {
      console.error('反推日期失败:', error);
      // 降级到本地计算
      calculatePossibleDatesLocal();
    } finally {
      setLoading(false);
    }
  };

  // 本地计算可能的日期（简化版）
  const calculatePossibleDatesLocal = () => {
    const dates = [];
    const currentYear = new Date().getFullYear();
    
    // 计算干支在六十甲子中的序号
    const getDayGanZhiIndex = (ganZhi) => {
      const gan = ganZhi[0];
      const zhi = ganZhi[1];
      const ganIndex = TIAN_GAN.indexOf(gan);
      const zhiIndex = DI_ZHI.indexOf(zhi);
      
      // 六十甲子序号计算
      // 天干和地支的组合有特定规律
      for (let i = 0; i < 60; i++) {
        if (i % 10 === ganIndex && i % 12 === zhiIndex) {
          return i;
        }
      }
      return 0;
    };

    const targetDayIndex = getDayGanZhiIndex(sizhu.day);
    const timeZhiIndex = DI_ZHI.indexOf(sizhu.hour[1]);
    
    // 1900年1月1日为基准日（甲戌日）
    const baseDate = new Date(1900, 0, 1);
    const baseDayIndex = 10; // 甲戌在六十甲子中的序号
    
    // 从当前年份往前60年到往后20年查找
    const startYear = currentYear - 60;
    const endYear = currentYear + 20;
    
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // 每60天采样一次（因为日柱60天一循环）
        for (let day = 1; day <= daysInMonth; day += 60) {
          for (let offset = 0; offset < 60 && day + offset <= daysInMonth; offset++) {
            const currentDay = day + offset;
            const checkDate = new Date(year, month - 1, currentDay);
            
            // 计算这一天距离基准日的天数
            const diffDays = Math.floor((checkDate - baseDate) / (1000 * 60 * 60 * 24));
            
            // 计算这一天的干支序号
            const currentDayIndex = (baseDayIndex + diffDays) % 60;
            
            // 如果匹配日柱
            if (currentDayIndex === targetDayIndex) {
              // 根据时柱地支推算时辰（每个地支对应2小时）
              const hour = timeZhiIndex * 2;
              
              dates.push({
                year: year,
                month: month,
                day: currentDay,
                hour: hour,
                minute: 0,
                lunarYear: year,
                lunarMonth: month,
                lunarDay: currentDay,
                isLeapMonth: false
              });
              
              // 限制每年最多2个结果
              if (dates.length >= 40) {
                setPossibleDates(dates.slice(0, 20));
                setShowDateSelectModal(true);
                return;
              }
            }
          }
        }
      }
    }

    // 限制返回数量
    setPossibleDates(dates.slice(0, 20));
    setShowDateSelectModal(true);
  };

  // 选择日期
  const selectDate = (dateOption) => {
    setGregorianDate({
      year: dateOption.year,
      month: dateOption.month,
      day: dateOption.day,
      hour: dateOption.hour,
      minute: dateOption.minute || 0
    });
    setLunarDate({
      year: dateOption.lunarYear,
      month: Math.abs(dateOption.lunarMonth), // 农历月可能为负数（闰月）
      day: dateOption.lunarDay,
      hour: dateOption.hour,
      minute: dateOption.minute || 0,
      isLeapMonth: dateOption.isLeapMonth || false
    });
    // 保持四柱输入模式，但标记已选择日期
    setShowDateSelectModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name) {
      setError('请输入姓名');
      setLoading(false);
      return;
    }

    try {
      const data = {
        name: formData.name,
        gender: formData.gender,
        inputType: inputType,
        addToCommunity: formData.addToCommunity
      };

      if (inputType === 'gregorian') {
        data.gregorianDate = gregorianDate;
      } else if (inputType === 'lunar') {
        data.lunarDate = lunarDate;
      } else if (inputType === 'sizhu') {
        data.sizhu = sizhu;
        
        // 如果选择了四柱对应的日期，同时上传公农历信息
        if (gregorianDate.year && gregorianDate.month && gregorianDate.day) {
          data.gregorianDate = gregorianDate;
        }
        if (lunarDate.year && lunarDate.month && lunarDate.day) {
          data.lunarDate = lunarDate;
        }
      }

      const response = await baziAPI.create(data);
      navigate(`/bazi/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || '提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderInputFields = () => {
    switch (inputType) {
      case 'gregorian':
        return (
          <div className="date-inputs">
            <div className="input-row">
              <div className="input-group">
                <label>年</label>
                <input
                  type="number"
                  value={gregorianDate.year}
                  onChange={(e) => setGregorianDate({ ...gregorianDate, year: parseInt(e.target.value) })}
                  min="1900"
                  max="2100"
                />
              </div>
              <div className="input-group">
                <label>月</label>
                <input
                  type="number"
                  value={gregorianDate.month}
                  onChange={(e) => setGregorianDate({ ...gregorianDate, month: parseInt(e.target.value) })}
                  min="1"
                  max="12"
                />
              </div>
              <div className="input-group">
                <label>日</label>
                <input
                  type="number"
                  value={gregorianDate.day}
                  onChange={(e) => setGregorianDate({ ...gregorianDate, day: parseInt(e.target.value) })}
                  min="1"
                  max="31"
                />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>时</label>
                <input
                  type="number"
                  value={gregorianDate.hour}
                  onChange={(e) => setGregorianDate({ ...gregorianDate, hour: parseInt(e.target.value) })}
                  min="0"
                  max="23"
                />
              </div>
              <div className="input-group">
                <label>分</label>
                <input
                  type="number"
                  value={gregorianDate.minute}
                  onChange={(e) => setGregorianDate({ ...gregorianDate, minute: parseInt(e.target.value) })}
                  min="0"
                  max="59"
                />
              </div>
            </div>
          </div>
        );

      case 'lunar':
        return (
          <div className="date-inputs">
            <div className="input-row">
              <div className="input-group">
                <label>年</label>
                <input
                  type="number"
                  value={lunarDate.year}
                  onChange={(e) => setLunarDate({ ...lunarDate, year: parseInt(e.target.value) })}
                  min="1900"
                  max="2100"
                />
              </div>
              <div className="input-group">
                <label>月</label>
                <input
                  type="number"
                  value={lunarDate.month}
                  onChange={(e) => setLunarDate({ ...lunarDate, month: parseInt(e.target.value) })}
                  min="1"
                  max="12"
                />
              </div>
              <div className="input-group">
                <label>日</label>
                <input
                  type="number"
                  value={lunarDate.day}
                  onChange={(e) => setLunarDate({ ...lunarDate, day: parseInt(e.target.value) })}
                  min="1"
                  max="30"
                />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>时</label>
                <input
                  type="number"
                  value={lunarDate.hour}
                  onChange={(e) => setLunarDate({ ...lunarDate, hour: parseInt(e.target.value) })}
                  min="0"
                  max="23"
                />
              </div>
              <div className="input-group">
                <label>分</label>
                <input
                  type="number"
                  value={lunarDate.minute}
                  onChange={(e) => setLunarDate({ ...lunarDate, minute: parseInt(e.target.value) })}
                  min="0"
                  max="59"
                />
              </div>
              <div className="input-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={lunarDate.isLeapMonth}
                    onChange={(e) => setLunarDate({ ...lunarDate, isLeapMonth: e.target.checked })}
                  />
                  闰月
                </label>
              </div>
            </div>
          </div>
        );

      case 'sizhu':
        return (
          <div className="sizhu-inputs">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowSizhuModal(true)}
            >
              选择四柱
            </button>
            <div className="sizhu-display">
              <span>年柱: {sizhu.year}</span>
              <span>月柱: {sizhu.month}</span>
              <span>日柱: {sizhu.day}</span>
              <span>时柱: {sizhu.hour}</span>
            </div>
            
            {/* 显示选择的对应日期 */}
            {gregorianDate.year && gregorianDate.month && gregorianDate.day && (
              <div className="selected-date-info">
                <div className="info-title">📅 对应日期时间</div>
                <div className="date-info-row">
                  <div className="date-info-item">
                    <span className="date-label">公历：</span>
                    <span className="date-value">
                      {gregorianDate.year}年{gregorianDate.month}月{gregorianDate.day}日 {gregorianDate.hour}:00
                    </span>
                  </div>
                  {lunarDate.year && lunarDate.month && lunarDate.day && (
                    <div className="date-info-item">
                      <span className="date-label">农历：</span>
                      <span className="date-value">
                        {lunarDate.year}年{lunarDate.isLeapMonth ? '闰' : ''}{lunarDate.month}月{lunarDate.day}日
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-clear-date"
                  onClick={() => {
                    setGregorianDate({ year: '', month: '', day: '', hour: 0, minute: 0 });
                    setLunarDate({ year: '', month: '', day: '', hour: 0, minute: 0, isLeapMonth: false });
                  }}
                >
                  清除日期
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bazi-input">
      <Navbar />
      <div className="container">
        <div className="card">
          <h1>新建八字排盘</h1>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>姓名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入姓名"
                required
              />
            </div>

            <div className="input-group">
              <label>性别</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>

            <div className="input-group">
              <label>输入方式</label>
              <div className="input-type-tabs">
                <button
                  type="button"
                  className={inputType === 'gregorian' ? 'active' : ''}
                  onClick={() => setInputType('gregorian')}
                >
                  公历
                </button>
                <button
                  type="button"
                  className={inputType === 'lunar' ? 'active' : ''}
                  onClick={() => setInputType('lunar')}
                >
                  农历
                </button>
                <button
                  type="button"
                  className={inputType === 'sizhu' ? 'active' : ''}
                  onClick={() => setInputType('sizhu')}
                >
                  四柱
                </button>
              </div>
            </div>

            {renderInputFields()}

            <div className="input-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.addToCommunity}
                  onChange={(e) => setFormData({ ...formData, addToCommunity: e.target.checked })}
                />
                添加到讨论社区
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                取消
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '计算中...' : '计算八字'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 四柱选择模态框 */}
      {showSizhuModal && (
        <div className="modal-overlay" onClick={() => setShowSizhuModal(false)}>
          <div className="modal-content sizhu-modal" onClick={(e) => e.stopPropagation()}>
            <h2>选择四柱</h2>
            <div className="sizhu-selectors-new">
              {['year', 'month', 'day', 'hour'].map((pillar) => {
                const pillarName = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' }[pillar];
                const currentValue = sizhu[pillar];
                const gan = currentValue ? currentValue[0] : '甲';
                const zhi = currentValue ? currentValue[1] : '子';
                
                return (
                  <div key={pillar} className="pillar-selector-new">
                    <div className="pillar-label">{pillarName}</div>
                    <div className="gan-zhi-selectors">
                      <div className="selector-group">
                        <label>天干</label>
                        <div className="button-grid">
                          {TIAN_GAN.map(g => (
                            <button
                              key={g}
                              type="button"
                              className={`gan-btn ${gan === g ? 'active' : ''}`}
                              onClick={() => setSizhu({ ...sizhu, [pillar]: g + zhi })}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="selector-group">
                        <label>地支</label>
                        <div className="button-grid">
                          {DI_ZHI.map(z => (
                            <button
                              key={z}
                              type="button"
                              className={`zhi-btn ${zhi === z ? 'active' : ''}`}
                              onClick={() => setSizhu({ ...sizhu, [pillar]: gan + z })}
                            >
                              {z}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="current-value">{currentValue}</div>
                  </div>
                );
              })}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowSizhuModal(false)}>
                取消
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  // 计算可能的日期
                  calculatePossibleDates();
                  setShowSizhuModal(false);
                }}
              >
                确认并选择日期
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 日期选择模态框 */}
      {showDateSelectModal && (
        <div className="modal-overlay" onClick={() => setShowDateSelectModal(false)}>
          <div className="modal-content date-select-modal" onClick={(e) => e.stopPropagation()}>
            <h2>选择对应的日期时间</h2>
            <p className="modal-hint">根据您选择的四柱，以下是可能的日期时间范围（最近120年）</p>
            <div className="date-options">
              {possibleDates.length > 0 ? (
                possibleDates.map((dateOption, index) => (
                  <div 
                    key={index} 
                    className="date-option-card"
                    onClick={() => selectDate(dateOption)}
                  >
                    <div className="date-option-main">
                      <div className="date-type">公历</div>
                      <div className="date-value">
                        {dateOption.year}年{dateOption.month}月{dateOption.day}日 
                        {dateOption.hour}:00
                      </div>
                    </div>
                    <div className="date-option-sub">
                      <div className="date-type">农历</div>
                      <div className="date-value">
                        {dateOption.lunarYear}年{dateOption.lunarMonth}月{dateOption.lunarDay}日
                        {dateOption.isLeapMonth && ' (闰月)'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-dates">
                  <p>未找到匹配的日期</p>
                  <p className="hint">您可以直接使用四柱进行计算</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDateSelectModal(false)}>
                取消
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setShowDateSelectModal(false);
                  // 直接使用四柱计算，不选择日期
                }}
              >
                直接使用四柱
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaziInput;

