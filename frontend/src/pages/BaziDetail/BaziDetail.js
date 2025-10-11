import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import WuxingDisplay from '../../components/WuxingDisplay';
import { baziAPI } from '../../api/api';
import './BaziDetail.css';

const BaziDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 流年流月选择
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [liunianData, setLiunianData] = useState([]);
  const [liuyueData, setLiuyueData] = useState([]);
  
  // 当前农历信息
  const [currentLunarInfo, setCurrentLunarInfo] = useState(null);

  useEffect(() => {
    fetchDetail();
    fetchCurrentLunar();
  }, [id]);

  // 获取当前农历信息
  const fetchCurrentLunar = async () => {
    try {
      const response = await baziAPI.getCurrentLunar();
      setCurrentLunarInfo(response.data.data);
    } catch (error) {
      console.error('获取当前农历信息失败:', error);
    }
  };

  // 实时计算流年流月
  useEffect(() => {
    if (selectedYear && currentLunarInfo) {
      setLiunianData(calculateLiunian(selectedYear));
      setLiuyueData(calculateLiuyue(selectedYear));
    }
  }, [selectedYear, currentLunarInfo]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await baziAPI.getById(id);
      setRecord(response.data.data);
      setError('');
    } catch (err) {
      setError('加载失败，请重试');
      console.error('获取详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWuxingColor = (element) => {
    const colorMap = {
      '金': '#FFD700',
      '木': '#228B22',
      '水': '#1E90FF',
      '火': '#FF4500',
      '土': '#8B4513'
    };
    return colorMap[element] || '#333';
  };

  const getGanWuxing = (gan) => {
    const ganWuxing = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    return ganWuxing[gan] || '';
  };

  const getZhiWuxing = (zhi) => {
    const zhiWuxing = {
      '寅': '木', '卯': '木',
      '巳': '火', '午': '火',
      '申': '金', '酉': '金',
      '亥': '水', '子': '水',
      '辰': '土', '戌': '土', '丑': '土', '未': '土'
    };
    return zhiWuxing[zhi] || '';
  };

  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.year) return '未知';
    return `${dateObj.year}年${dateObj.month}月${dateObj.day}日 ${dateObj.hour || 0}时${dateObj.minute || 0}分`;
  };

  // 天干地支常量
  const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // 计算流年（前后各5年）
  const calculateLiunian = (centerYear) => {
    const liunian = [];
    const startYear = centerYear - 5;
    
    for (let i = 0; i < 11; i++) {
      const year = startYear + i;
      const ganIndex = (year - 4) % 10;
      const zhiIndex = (year - 4) % 12;
      
      liunian.push({
        year: year,
        gan: TIAN_GAN[ganIndex],
        zhi: DI_ZHI[zhiIndex],
        isCurrent: year === currentYear
      });
    }
    
    return liunian;
  };

  // 计算流月（五虎遁月诀）
  const calculateLiuyue = (year) => {
    const liuyue = [];
    const yearGanIndex = (year - 4) % 10;
    
    // 五虎遁月诀：甲己之年丙作首，乙庚之岁戊为头，丙辛必定寻庚起，丁壬壬位顺行流，戊癸甲寅好追求
    const firstMonthGanMap = {
      0: 2, 5: 2,  // 甲、己年从丙起
      1: 4, 6: 4,  // 乙、庚年从戊起
      2: 6, 7: 6,  // 丙、辛年从庚起
      3: 8, 8: 8,  // 丁、壬年从壬起
      4: 0, 9: 0   // 戊、癸年从甲起
    };
    
    let monthGanIndex = firstMonthGanMap[yearGanIndex];
    
    // 获取当前农历月份（使用从API获取的准确信息）
    let currentLunarMonth = null;
    let currentLunarYear = null;
    
    if (currentLunarInfo) {
      currentLunarMonth = Math.abs(currentLunarInfo.month); // 农历月可能是负数（闰月）
      currentLunarYear = currentLunarInfo.year;
    }
    
    for (let month = 1; month <= 12; month++) {
      const isCurrentMonth = currentLunarInfo && 
                            year === currentLunarYear && 
                            month === currentLunarMonth+1;
      
      liuyue.push({
        month: month,
        gan: TIAN_GAN[monthGanIndex % 10],
        zhi: DI_ZHI[(month + 1) % 12],
        isCurrent: isCurrentMonth
      });
      monthGanIndex++;
    }
    
    return liuyue;
  };

  if (loading) {
    return (
      <div className="bazi-detail">
        <Navbar />
        <div className="container">
          <div className="loading-container">加载中...</div>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="bazi-detail">
        <Navbar />
        <div className="container">
          <div className="error-container">
            <p>{error || '记录不存在'}</p>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { baziResult } = record;

  return (
    <div className="bazi-detail">
      <Navbar />
      <div className="container">
        <div className="detail-header">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            ← 返回
          </button>
          <h1>八字详情</h1>
        </div>

        {/* 基本信息 */}
        <div className="card">
          <h2>基本信息</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">姓名：</span>
              <span className="info-value">{record.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">性别：</span>
              <span className="info-value">{record.gender}</span>
            </div>
            <div className="info-item">
              <span className="info-label">公历：</span>
              <span className="info-value">{formatDate(record.gregorianDate)}</span>
            </div>
            {record.lunarDate && record.lunarDate.year && (
              <div className="info-item">
                <span className="info-label">农历：</span>
                <span className="info-value">
                  {formatDate(record.lunarDate)}
                  {record.lunarDate.isLeapMonth && ' (闰月)'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 四柱 */}
        <div className="card">
          <h2>四柱八字</h2>
          <div className="sizhu-display-detail">
            {['year', 'month', 'day', 'hour'].map((pillar) => {
              const pillarName = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' }[pillar];
              const pillarData = baziResult[`${pillar}Pillar`];
              const ganWuxing = getGanWuxing(pillarData.gan);
              const zhiWuxing = getZhiWuxing(pillarData.zhi);
              
              return (
                <div key={pillar} className="pillar-detail">
                  <div className="pillar-name">{pillarName}</div>
                  <div className="pillar-chars">
                    <span 
                      className="char gan"
                      style={{ color: getWuxingColor(ganWuxing) }}
                    >
                      {pillarData.gan}
                    </span>
                    <span 
                      className="char zhi"
                      style={{ color: getWuxingColor(zhiWuxing) }}
                    >
                      {pillarData.zhi}
                    </span>
                  </div>
                  <div className="pillar-wuxing">
                    <span style={{ color: getWuxingColor(ganWuxing) }}>
                      {ganWuxing}
                    </span>
                    <span style={{ color: getWuxingColor(zhiWuxing) }}>
                      {zhiWuxing}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 藏干 */}
        <div className="card">
          <h2>地支藏干</h2>
          <div className="canggan-grid">
            {['year', 'month', 'day', 'hour'].map((pillar) => {
              const pillarName = { year: '年支', month: '月支', day: '日支', hour: '时支' }[pillar];
              const hiddenGans = baziResult.hiddenGan[pillar] || [];
              
              return (
                <div key={pillar} className="canggan-item">
                  <div className="canggan-label">{pillarName}</div>
                  <div className="canggan-values">
                    {hiddenGans.map((gan, index) => {
                      const wuxing = getGanWuxing(gan);
                      return (
                        <span 
                          key={index}
                          style={{ color: getWuxingColor(wuxing) }}
                        >
                          {gan}({wuxing})
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 五行 */}
        <div className="card">
          <WuxingDisplay wuxing={baziResult.wuxing} />
        </div>

        {/* 大运 */}
        {baziResult.dayun && baziResult.dayun.length > 0 && (
          <div className="card">
            <h2>大运排盘</h2>
            {baziResult.qiyunAge && (
              <div className="qiyun-info-box">
                <div className="qiyun-title">🕐 起运时间</div>
                <div className="qiyun-details">
                  <span className="qiyun-value">
                    {baziResult.qiyunAge.years}岁 {baziResult.qiyunAge.months}个月 {baziResult.qiyunAge.days}天
                  </span>
                  {record.gregorianDate && record.gregorianDate.year && (
                    <span className="qiyun-date">
                      （约{record.gregorianDate.year + baziResult.qiyunAge.years}年起运）
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="dayun-grid">
              {baziResult.dayun.map((yun, index) => {
                const ganWuxing = getGanWuxing(yun.gan);
                const zhiWuxing = getZhiWuxing(yun.zhi);
                
                // 判断是否是当前大运
                const birthYear = record.gregorianDate?.year || 0;
                const currentAge = currentYear - birthYear;
                const isCurrent = currentAge >= yun.age && (index === baziResult.dayun.length - 1 || currentAge < baziResult.dayun[index + 1]?.age);
                
                return (
                  <div key={index} className={`dayun-item ${isCurrent ? 'current' : ''}`}>
                    <div className="dayun-age">{yun.age}岁</div>
                    <div className="dayun-ganzhi">
                      <span style={{ color: getWuxingColor(ganWuxing) }}>{yun.gan}</span>
                      <span style={{ color: getWuxingColor(zhiWuxing) }}>{yun.zhi}</span>
                    </div>
                    <div className="dayun-year">{yun.startYear}年</div>
                    {isCurrent && <div className="current-badge">当前</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 神煞 */}
        {baziResult.shensha && baziResult.shensha.length > 0 && (
          <div className="card">
            <h2>神煞</h2>
            <div className="shensha-list">
              {baziResult.shensha.map((sha, index) => (
                <span key={index} className="shensha-badge">{sha}</span>
              ))}
            </div>
          </div>
        )}

        {/* 流年 - 实时计算 */}
        <div className="card">
          <div className="card-header-with-control">
            <h2>流年排盘</h2>
            <div className="year-selector">
              <button 
                className="year-nav-btn"
                onClick={() => setSelectedYear(selectedYear - 10)}
              >
                ←
              </button>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="year-select"
              >
                {Array.from({ length: 100 }, (_, i) => currentYear - 50 + i).map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
              <button 
                className="year-nav-btn"
                onClick={() => setSelectedYear(selectedYear + 10)}
              >
                →
              </button>
              <button 
                className="btn-today"
                onClick={() => setSelectedYear(currentYear)}
              >
                今年
              </button>
            </div>
          </div>
          <div className="liunian-grid">
            {liunianData.map((nian, index) => {
              const ganWuxing = getGanWuxing(nian.gan);
              const zhiWuxing = getZhiWuxing(nian.zhi);
              
              return (
                <div key={index} className={`liunian-item ${nian.isCurrent ? 'current' : ''}`}>
                  <div className="liunian-year">{nian.year}</div>
                  <div className="liunian-ganzhi">
                    <span style={{ color: getWuxingColor(ganWuxing) }}>{nian.gan}</span>
                    <span style={{ color: getWuxingColor(zhiWuxing) }}>{nian.zhi}</span>
                  </div>
                  {nian.isCurrent && <div className="current-badge">当前</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* 流月 - 实时计算 */}
        <div className="card">
          <h2>流月排盘（{selectedYear}年）</h2>
          <p className="liuyue-hint">
            💡 五虎遁月诀：甲己之年丙作首，乙庚之岁戊为头，丙辛必定寻庚起，丁壬壬位顺行流，戊癸甲寅好追求
            {currentLunarInfo && selectedYear === currentLunarInfo.year && (
              <span className="current-lunar-info">
                （当前：农历{Math.abs(currentLunarInfo.month+1)}月 - {currentLunarInfo.monthInGanZhi}）
              </span>
            )}
          </p>
          <div className="liuyue-grid">
            {liuyueData.map((yue, index) => {
              const ganWuxing = getGanWuxing(yue.gan);
              const zhiWuxing = getZhiWuxing(yue.zhi);
              
              return (
                <div key={index} className={`liuyue-item ${yue.isCurrent ? 'current' : ''}`}>
                  <div className="liuyue-month">{yue.month}月</div>
                  <div className="liuyue-ganzhi">
                    <span style={{ color: getWuxingColor(ganWuxing) }}>{yue.gan}</span>
                    <span style={{ color: getWuxingColor(zhiWuxing) }}>{yue.zhi}</span>
                  </div>
                  {yue.isCurrent && <div className="current-badge">当前</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaziDetail;

