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

  const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>选择四柱</h2>
            <div className="sizhu-selectors">
              {['year', 'month', 'day', 'hour'].map((pillar) => (
                <div key={pillar} className="pillar-selector">
                  <label>{pillar === 'year' ? '年柱' : pillar === 'month' ? '月柱' : pillar === 'day' ? '日柱' : '时柱'}</label>
                  <select
                    value={sizhu[pillar]}
                    onChange={(e) => setSizhu({ ...sizhu, [pillar]: e.target.value })}
                  >
                    {TIAN_GAN.map(gan => 
                      DI_ZHI.map(zhi => (
                        <option key={`${gan}${zhi}`} value={`${gan}${zhi}`}>
                          {gan}{zhi}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowSizhuModal(false)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={() => setShowSizhuModal(false)}>
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaziInput;

