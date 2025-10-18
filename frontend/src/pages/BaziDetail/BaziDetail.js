import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import WuxingDisplay from '../../components/WuxingDisplay';
import { baziAPI } from '../../api/api';
import { calculateDayun, calculateDayunManual } from '../../utils/dayun-calculator';
import { 
  calculateDiShi, 
  calculateNaYin, 
  calculateDiShiByDate,
  calculateNaYinByDate,
  getDiShiColor,
  getNaYinColor,
  getZhiBenQi
} from '../../utils/bazi-utils';
import { 
  calculateHiddenGan, 
  calculateWuxing, 
  getGanWuxing, 
  getZhiWuxing, 
  getWuxingColor 
} from '../../utils/wuxing-calculator';
import {
  isYangGan,
  getGanWuxingType,
  getWuxingRelation,
  getShishen,
  getShishenColor
} from '../../utils/shishen-calculator';
import {
  TIAN_GAN,
  DI_ZHI,
  calculateLiunian,
  calculateLiuyue,
  formatDate
} from '../../utils/liunian-calculator';
import { calculateShensha } from '../../utils/shensha-calculator';
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

  // 大运数据（本地计算）
  const [dayunData, setDayunData] = useState({
    dayunList: [],
    qiyunAge: { years: 0, months: 0, days: 0 }
  });
  
  // 地势和纳音数据（本地计算）
  const [diShiData, setDiShiData] = useState({
    year: '', month: '', day: '', hour: ''
  });
  const [naYinData, setNaYinData] = useState({
    year: '', month: '', day: '', hour: ''
  });
  
  // 神煞数据（本地计算）
  const [shenshaData, setShenshaData] = useState([]);

  // 前端计算的五行数据
  const [wuxingData, setWuxingData] = useState({ jin: 0, mu: 0, shui: 0, huo: 0, tu: 0 });
  const [frontendHiddenGan, setFrontendHiddenGan] = useState({});

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
      setLiunianData(calculateLiunian(selectedYear, currentYear));
      setLiuyueData(calculateLiuyue(selectedYear, currentLunarInfo));
    }
  }, [selectedYear, currentLunarInfo, currentYear]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await baziAPI.getById(id);
      const recordData = response.data.data;
      setRecord(recordData);
      
      // 前端计算藏干和五行比例
      if (recordData.baziResult) {
        const hiddenGan = calculateHiddenGan(recordData.baziResult);
        const wuxing = calculateWuxing(recordData.baziResult, hiddenGan);
        setFrontendHiddenGan(hiddenGan);
        setWuxingData(wuxing);
      }

      // 本地计算大运
      if (recordData.gregorianDate && recordData.gregorianDate.year) {
        console.log('record: ', recordData)
        const dayunResult = calculateDayun(
          recordData.gregorianDate,
          recordData.gender,
          recordData.baziResult.monthPillar
        );
        setDayunData(dayunResult);
        
        // 本地计算地势和纳音
        const diShiResult = calculateDiShiByDate(recordData.gregorianDate);
        const naYinResult = calculateNaYinByDate(recordData.gregorianDate);
        setDiShiData(diShiResult);
        setNaYinData(naYinResult);
      } else if (recordData.baziResult && recordData.baziResult.monthPillar) {
        // 如果没有完整日期，使用手动计算（备用方案）
        const dayunResult = calculateDayunManual(
          recordData.baziResult.monthPillar,
          recordData.baziResult.yearPillar.gan,
          recordData.gender,
          new Date().getFullYear() - 30 // 假设年龄
        );
        setDayunData(dayunResult);
        
        // 从四柱直接计算地势和纳音
        const baziResult = recordData.baziResult;
        setDiShiData({
          year: calculateDiShi(baziResult.yearPillar.gan, baziResult.yearPillar.zhi),
          month: calculateDiShi(baziResult.monthPillar.gan, baziResult.monthPillar.zhi),
          day: calculateDiShi(baziResult.dayPillar.gan, baziResult.dayPillar.zhi),
          hour: calculateDiShi(baziResult.hourPillar.gan, baziResult.hourPillar.zhi)
        });
        setNaYinData({
          year: calculateNaYin(baziResult.yearPillar.gan, baziResult.yearPillar.zhi),
          month: calculateNaYin(baziResult.monthPillar.gan, baziResult.monthPillar.zhi),
          day: calculateNaYin(baziResult.dayPillar.gan, baziResult.dayPillar.zhi),
          hour: calculateNaYin(baziResult.hourPillar.gan, baziResult.hourPillar.zhi)
        });
      }
      
      // 本地计算神煞
      if (recordData.baziResult) {
        const baziResult = recordData.baziResult;
        const localShensha = calculateShensha(
          baziResult.dayPillar.gan,
          baziResult.yearPillar.zhi,
          baziResult.monthPillar.zhi,
          baziResult.dayPillar.zhi,
          baziResult.hourPillar.zhi
        );
        setShenshaData(localShensha);
      }

      setError('');
    } catch (err) {
      setError('加载失败，请重试');
      console.error('获取详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 这里已移除十神计算相关函数，改为从shishen-calculator.js导入

  // 这里已移除日期格式化、天干地支常量、流年流月计算相关函数，改为从liunian-calculator.js导入

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
  console.log(baziResult)
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

              // 计算天干十神（只有日柱天干才是日主）
              const riGan = baziResult.dayPillar?.gan;
              const isDayGan = pillar === 'day';
              const ganShishen = getShishen(riGan, pillarData.gan, isDayGan);
              
              // 获取地势和纳音
              const dishi = diShiData[pillar];
              const nayin = naYinData[pillar];

              return (
                <div key={pillar} className="pillar-detail">
                  <div className="pillar-name">{pillarName}</div>
                  <div className="pillar-chars">
                    {/* 天干十神（显示在天干上方） */}
                    <div
                      className="shishen-label"
                      style={{ color: getShishenColor(ganShishen) }}
                    >
                      {ganShishen}
                    </div>
                    {/* 天干 */}
                    <span
                      className="char gan"
                      style={{ color: getWuxingColor(ganWuxing) }}
                    >
                      {pillarData.gan}
                    </span>
                    {/* 地支 */}
                    <span
                      className="char zhi"
                      style={{ color: getWuxingColor(zhiWuxing) }}
                    >
                      {pillarData.zhi}
                    </span>
                    {/* 地势（十二长生） */}
                    {dishi && (
                      <div 
                        className="dishi-label"
                        style={{ color: getDiShiColor(dishi) }}
                      >
                        {dishi}
                      </div>
                    )}
                  </div>
                  {/* 纳音 */}
                  {nayin && (
                    <div 
                      className="nayin-label"
                      style={{ color: getNaYinColor(nayin) }}
                    >
                      {nayin}
                    </div>
                  )}
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
              const pillarData = baziResult[`${pillar}Pillar`];
              const hiddenGans = baziResult.hiddenGan[pillar] || [];
              const riGan = baziResult.dayPillar?.gan;

              return (
                <div key={pillar} className="canggan-item">
                  <div className="canggan-label">
                    {pillarName}（{pillarData.zhi}）
                  </div>
                  <div className="canggan-values">
                    {hiddenGans.map((gan, index) => {
                      const wuxing = getGanWuxing(gan);
                      const shishen = getShishen(riGan, gan);
                      return (
                        <div key={index} className="canggan-item-detail">
                          <span
                            className="canggan-gan"
                            style={{ color: getWuxingColor(wuxing) }}
                          >
                            {gan}
                          </span>
                          <span className="canggan-wuxing">
                            ({wuxing})
                          </span>
                          {/* 藏干十神（显示在藏干下方） */}
                          <div
                            className="canggan-shishen"
                            style={{ color: getShishenColor(shishen) }}
                          >
                            {shishen}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* 神煞 */}
          {shenshaData && shenshaData.length > 0 && (
            <div className="shensha-section">
              <h3>神煞</h3>
              <div className="shensha-list">
                {shenshaData.map((sha, index) => (
                  <span key={index} className="shensha-badge">{sha}</span>
                ))}
              </div>
            </div>
          )}
        </div>

     {/* 五行 - 前端计算 */}
        <div className="card">
          <h2>五行分析 </h2>
          <WuxingDisplay wuxing={wuxingData} />
        </div>

        {/* 大运 - 本地计算 */}
        {dayunData.dayunList && dayunData.dayunList.length > 0 && (
          <div className="card">
            <h2>大运排盘</h2>
            {dayunData.qiyunAge && (
              <div className="qiyun-info-box">
                <div className="qiyun-title">🕐 起运时间</div>
                <div className="qiyun-details">
                  <span className="qiyun-value">
                    {dayunData.qiyunAge.years}岁 {dayunData.qiyunAge.months}个月 {dayunData.qiyunAge.days}天
                  </span>
                  {record.gregorianDate && record.gregorianDate.year && (
                    <span className="qiyun-date">
                      （约{record.gregorianDate.year + dayunData.qiyunAge.years}年起运）
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="dayun-grid">
              {dayunData.dayunList.map((yun, index) => {
                const ganWuxing = getGanWuxing(yun.gan);
                const zhiWuxing = getZhiWuxing(yun.zhi);

                // 判断是否是当前大运
                const birthYear = record.gregorianDate?.year || 0;
                const currentAge = currentYear - birthYear;
                const isCurrent = currentAge >= yun.age && (index === dayunData.dayunList.length - 1 || currentAge < dayunData.dayunList[index + 1]?.age);

                // 计算大运天干十神
                const riGan = baziResult.dayPillar?.gan;
                const ganShishen = getShishen(riGan, yun.gan);
                
                // 计算大运地支十神（通过地支本气）
                const zhiBenQi = getZhiBenQi(yun.zhi);
                const zhiShishen = zhiBenQi ? getShishen(riGan, zhiBenQi) : '';
                
                // 计算大运地势和纳音
                const dishi = calculateDiShi(yun.gan, yun.zhi);
                const nayin = calculateNaYin(yun.gan, yun.zhi);

                return (
                  <div key={index} className={`dayun-item ${isCurrent ? 'current' : ''}`}>
                    <div className="dayun-age">{yun.age}岁</div>
                    
                    {/* 干支及十神 */}
                    <div className="dayun-ganzhi-container">
                      {/* 天干部分 */}
                      <div className="dayun-gan-section">
                        {ganShishen && (
                          <div className="dayun-gan-shishen" style={{ color: getShishenColor(ganShishen) }}>
                            {ganShishen}
                          </div>
                        )}
                        <span className="dayun-gan" style={{ color: getWuxingColor(ganWuxing) }}>
                          {yun.gan}
                        </span>
                      </div>
                      
                      {/* 地支部分 */}
                      <div className="dayun-zhi-section">
                        {zhiShishen && (
                          <div className="dayun-zhi-shishen" style={{ color: getShishenColor(zhiShishen) }}>
                            {zhiShishen}
                          </div>
                        )}
                        <span className="dayun-zhi" style={{ color: getWuxingColor(zhiWuxing) }}>
                          {yun.zhi}
                        </span>
                      </div>
                    </div>
                    
                    {/* 地势 */}
                    {dishi && (
                      <div className="dayun-dishi" style={{ color: getDiShiColor(dishi) }}>
                        {dishi}
                      </div>
                    )}
                    {/* 纳音 */}
                    {nayin && (
                      <div className="dayun-nayin" style={{ color: getNaYinColor(nayin) }}>
                        {nayin}
                      </div>
                    )}
                    <div className="dayun-year">{yun.startYear}年</div>
                    {isCurrent && <div className="current-badge">当前</div>}
                  </div>
                );
              })}
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

              // 计算流年天干十神
              const riGan = baziResult.dayPillar?.gan;
              const ganShishen = getShishen(riGan, nian.gan);

              return (
                <div key={index} className={`liunian-item ${nian.isCurrent ? 'current' : ''}`}>
                  <div className="liunian-year">{nian.year}</div>
                  {/* 十神 */}
                  <div className="liunian-shishen" style={{ color: getShishenColor(ganShishen) }}>
                    {ganShishen}
                  </div>
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

              // 计算流月天干十神
              const riGan = baziResult.dayPillar?.gan;
              const ganShishen = getShishen(riGan, yue.gan);

              return (
                <div key={index} className={`liuyue-item ${yue.isCurrent ? 'current' : ''}`}>
                  <div className="liuyue-month">{yue.month}月</div>
                  {/* 十神 */}
                  <div className="liuyue-shishen" style={{ color: getShishenColor(ganShishen) }}>
                    {ganShishen}
                  </div>
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

