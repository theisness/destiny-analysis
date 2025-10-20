import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { baziAPI } from '../../api/api';
import './BaziInput.css';
import { Solar } from 'lunar-javascript';

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
  const [sizhu, setSizhu] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSizhuModal, setShowSizhuModal] = useState(false);
  const [showDateSelectModal, setShowDateSelectModal] = useState(false);
  const [possibleDates, setPossibleDates] = useState([]);
  // 添加状态用于存储当前选择的天干和地支
  const [currentSelection, setCurrentSelection] = useState({
    pillar: null, // 当前正在选择的柱（year, month, day, hour）
    gan: null,    // 当前选择的天干
    zhi: null     // 当前选择的地支
  });
  // 四柱反推计算中的状态
  const [sizhuCalculating, setSizhuCalculating] = useState(false);
  
  // 打开四柱模态框时，重置当前选择，确保初始不选中
  useEffect(() => {
    if (showSizhuModal) {
      setCurrentSelection({ pillar: null, gan: '', zhi: '' });
    }
  }, [showSizhuModal]);
  const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 天干地支的有效组合映射
  const GAN_ZHI_VALID_COMBINATIONS = {
    '甲': ['子', '寅', '辰', '午', '申', '戌'],
    '乙': ['丑', '卯', '巳', '未', '酉', '亥'],
    '丙': ['子', '寅', '辰', '午', '申', '戌'],
    '丁': ['丑', '卯', '巳', '未', '酉', '亥'],
    '戊': ['子', '寅', '辰', '午', '申', '戌'],
    '己': ['丑', '卯', '巳', '未', '酉', '亥'],
    '庚': ['子', '寅', '辰', '午', '申', '戌'],
    '辛': ['丑', '卯', '巳', '未', '酉', '亥'],
    '壬': ['子', '寅', '辰', '午', '申', '戌'],
    '癸': ['丑', '卯', '巳', '未', '酉', '亥']
  };
  
  const ZHI_GAN_VALID_COMBINATIONS = {
    '子': ['甲', '丙', '戊', '庚', '壬'],
    '丑': ['乙', '丁', '己', '辛', '癸'],
    '寅': ['甲', '丙', '戊', '庚', '壬'],
    '卯': ['乙', '丁', '己', '辛', '癸'],
    '辰': ['甲', '丙', '戊', '庚', '壬'],
    '巳': ['乙', '丁', '己', '辛', '癸'],
    '午': ['甲', '丙', '戊', '庚', '壬'],
    '未': ['乙', '丁', '己', '辛', '癸'],
    '申': ['甲', '丙', '戊', '庚', '壬'],
    '酉': ['乙', '丁', '己', '辛', '癸'],
    '戌': ['甲', '丙', '戊', '庚', '壬'],
    '亥': ['乙', '丁', '己', '辛', '癸']
  };

  // 计算可能的日期范围
  const calculatePossibleDates = async () => {
    try {
      setSizhuCalculating(true);
      const data = await reverseCalculateDatesFrontend(sizhu);
      setPossibleDates(data || []);
      setShowDateSelectModal(true);
    } catch (error) {
      console.error('反推日期失败:', error);
      setError('反推日期失败');
    } finally {
      setSizhuCalculating(false);
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
              onClick={() => { setCurrentSelection({ pillar: null, gan: '', zhi: '' }); setShowSizhuModal(true); }}
            >
              选择四柱
            </button>
            <div className="sizhu-display">
              <span>年柱: {sizhu.year || '未选择'}</span>
              <span>月柱: {sizhu.month || '未选择'}</span>
              <span>日柱: {sizhu.day || '未选择'}</span>
              <span>时柱: {sizhu.hour || '未选择'}</span>
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
        <div className="modal-overlay" onClick={() => !sizhuCalculating && setShowSizhuModal(false)}>
          <div className="modal-content sizhu-modal" onClick={(e) => e.stopPropagation()}>
            <h2>选择四柱</h2>
            {sizhuCalculating && (
              <div className="modal-hint" style={{marginTop: '8px', color: '#667eea', fontWeight: 600}}>
                计算中...
              </div>
            )}
            <div className="sizhu-selectors-new">
              {['year', 'month', 'day', 'hour'].map((pillar) => {
                const pillarName = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' }[pillar];
                const currentValue = sizhu[pillar];
                // 初始状态为未选择状态，不默认选择甲子
                const gan = currentValue ? currentValue[0] : '';
                const zhi = currentValue ? currentValue[1] : '';
                // 支持部分选择的高亮：如果尚未组成干支，则使用当前正在选择的部分
                const selectedGan = gan || (currentSelection.pillar === pillar ? (currentSelection.gan || '') : '');
                const selectedZhi = zhi || (currentSelection.pillar === pillar ? (currentSelection.zhi || '') : '');
                
                return (
                  <div key={pillar} className="pillar-selector-new">
                    <div className="pillar-label">{pillarName}</div>
                    <div className="gan-zhi-selectors">
                      <div className="selector-group">
                        <label>天干</label>
                        <div className="button-grid">
                          {TIAN_GAN.map(g => {
                            const isDisabled = selectedZhi && !ZHI_GAN_VALID_COMBINATIONS[selectedZhi].includes(g);
                            return (
                              <button
                                key={g}
                                type="button"
                                className={`gan-btn ${selectedGan === g ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                                onClick={() => {
                                  if (selectedZhi) {
                                    setSizhu({ ...sizhu, [pillar]: g + selectedZhi });
                                  }
                                  setCurrentSelection({ pillar, gan: g, zhi: selectedZhi || '' });
                                }}
                              >
                                {g}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="selector-group">
                        <label>地支</label>
                        <div className="button-grid">
                          {DI_ZHI.map(z => {
                            const isDisabled = selectedGan && !GAN_ZHI_VALID_COMBINATIONS[selectedGan].includes(z);
                            return (
                              <button
                                key={z}
                                type="button"
                                className={`zhi-btn ${selectedZhi === z ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                                onClick={() => {
                                  if (selectedGan) {
                                    setSizhu({ ...sizhu, [pillar]: selectedGan + z });
                                  }
                                  setCurrentSelection({ pillar, gan: selectedGan || '', zhi: z });
                                }}
                              >
                                {z}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="pillar-actions">
                      <div className="current-value">{currentValue || '未选择'}</div>
                      {currentValue && (
                        <button 
                          type="button" 
                          className="btn-clear-pillar"
                          onClick={() => {
                            const newSizhu = { ...sizhu };
                            delete newSizhu[pillar];
                            setSizhu(newSizhu);
                            setCurrentSelection({ pillar, gan: '', zhi: '' });
                          }}
                        >
                          清空
                        </button>
                      )}
                    </div>
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
                disabled={sizhuCalculating || !['year','month','day','hour'].every(p => !!(sizhu[p] && sizhu[p].length === 2))}
                onClick={() => {
                  calculatePossibleDates().finally(() => setShowSizhuModal(false));
                }}
              >
                {sizhuCalculating ? '计算中...' : '确认并选择日期'}
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
            <p className="modal-hint">根据您选择的四柱，以下是可能的日期时间范围（向前120年）</p>
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


// 计算可能的日期范围
const reverseCalculateDatesFrontend = async (sizhu) => {
  const results = [];
  if (!sizhu || !sizhu.year || !sizhu.month || !sizhu.day || !sizhu.hour) return results;

  // 从时柱地支推算时辰（每个地支对应两个小时：子时为 0-1 点，以 0 表示）
  const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const hourZhi = sizhu.hour[1];
  const hourIndex = zhiList.indexOf(hourZhi);
  if (hourIndex === -1) return results;
  const hour = hourIndex * 2;

  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 120; // 向前 120 年
  const endYear = currentYear;

  // 逐年、逐月、逐日检查（按 60 天分段遍历以减少计算量）
  for (let year = endYear; year >= startYear; year--) {
    for (let month = 12; month >= 1; month--) {
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let startDay = 1; startDay <= daysInMonth; startDay += 60) {
        for (let dayOffset = 0; dayOffset < 60 && startDay + dayOffset <= daysInMonth; dayOffset++) {
          const day = startDay + dayOffset;
          try {
            const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
            const lunar = solar.getLunar();
            const yearGanZhi = lunar.getYearInGanZhi();
            const monthGanZhi = lunar.getMonthInGanZhi();
            const dayGanZhi = lunar.getDayInGanZhi();
            const timeGanZhi = lunar.getTimeInGanZhi();

            if (
              yearGanZhi === sizhu.year &&
              monthGanZhi === sizhu.month &&
              dayGanZhi === sizhu.day &&
              timeGanZhi === sizhu.hour
            ) {
              results.push({
                year,
                month,
                day,
                hour,
                minute: 0,
                lunarYear: lunar.getYear(),
                lunarMonth: lunar.getMonth(),
                lunarDay: lunar.getDay(),
                isLeapMonth: lunar.getMonth() < 0
              });
              // 限制结果上限，避免长时间阻塞
              if (results.length >= 5) {
                return results;
              }
            }
          } catch (e) {
            // 跳过非法日期或计算异常
          }
        }
      }
      // 每月让出事件循环，避免 UI 阻塞
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    // 每年让出事件循环
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return results;
};

