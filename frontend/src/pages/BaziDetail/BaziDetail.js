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
  getZhiBenQi,
  getZhiCangGan
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
import SizhuCard from '../../components/SizhuCard';
import CangganCard from '../../components/CangganCard';
import SevenGridCard from '../../components/SevenGridCard';
import LiunianCard from '../../components/LiunianCard';
import LiuyueCard from '../../components/LiuyueCard';
import DayunCard from '../../components/DayunCard';

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
        <SizhuCard baziResult={baziResult} diShiData={diShiData} naYinData={naYinData} />

        {/* 藏干 */}
        <CangganCard baziResult={baziResult} shenshaData={shenshaData} />

     {/* 五行 - 前端计算 */}
        <div className="card">
          <h2>五行分析 </h2>
          <WuxingDisplay wuxing={wuxingData} />
        </div>

        {/* 大运 - 本地计算 */}
        {dayunData.dayunList && dayunData.dayunList.length > 0 && (
          <DayunCard
            dayunData={dayunData}
            baziResult={baziResult}
            birthYear={record.gregorianDate?.year}
            currentYear={currentYear}
          />
        )}

        {/* 流年 - 实时计算 */}
        <LiunianCard
          liunianData={liunianData}
          selectedYear={selectedYear}
          currentYear={currentYear}
          onPrevDecade={() => setSelectedYear(selectedYear - 10)}
          onNextDecade={() => setSelectedYear(selectedYear + 10)}
          onSetYear={(y) => setSelectedYear(y)}
          onToday={() => setSelectedYear(currentYear)}
          baziResult={baziResult}
        />

        {/* 流月 - 实时计算 */}
        <LiuyueCard
          liuyueData={liuyueData}
          selectedYear={selectedYear}
          currentLunarInfo={currentLunarInfo}
          baziResult={baziResult}
        />
        {/* 七列综合排盘 */}
        <SevenGridCard
          baziResult={baziResult}
          dayunData={dayunData}
          liunianData={liunianData}
          liuyueData={liuyueData}
          diShiData={diShiData}
          naYinData={naYinData}
          selectedYear={selectedYear}
          currentYear={currentYear}
          frontendHiddenGan={frontendHiddenGan}
        />
      </div>
    </div>
  );
};

export default BaziDetail;

