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

  useEffect(() => {
    fetchDetail();
  }, [id]);

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
            <h2>大运</h2>
            {baziResult.qiyunAge && (
              <p className="qiyun-info">
                起运时间：{baziResult.qiyunAge.years}岁{baziResult.qiyunAge.months}个月{baziResult.qiyunAge.days}天
              </p>
            )}
            <div className="dayun-grid">
              {baziResult.dayun.map((yun, index) => {
                const ganWuxing = getGanWuxing(yun.gan);
                const zhiWuxing = getZhiWuxing(yun.zhi);
                
                return (
                  <div key={index} className="dayun-item">
                    <div className="dayun-age">{yun.age}岁</div>
                    <div className="dayun-ganzhi">
                      <span style={{ color: getWuxingColor(ganWuxing) }}>{yun.gan}</span>
                      <span style={{ color: getWuxingColor(zhiWuxing) }}>{yun.zhi}</span>
                    </div>
                    <div className="dayun-year">{yun.startYear}年起</div>
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

        {/* 流年 */}
        {baziResult.liunian && baziResult.liunian.length > 0 && (
          <div className="card">
            <h2>流年</h2>
            <div className="liunian-grid">
              {baziResult.liunian.map((nian, index) => {
                const ganWuxing = getGanWuxing(nian.gan);
                const zhiWuxing = getZhiWuxing(nian.zhi);
                
                return (
                  <div key={index} className="liunian-item">
                    <div className="liunian-year">{nian.year}</div>
                    <div className="liunian-ganzhi">
                      <span style={{ color: getWuxingColor(ganWuxing) }}>{nian.gan}</span>
                      <span style={{ color: getWuxingColor(zhiWuxing) }}>{nian.zhi}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 流月 */}
        {baziResult.liuyue && baziResult.liuyue.length > 0 && (
          <div className="card">
            <h2>流月</h2>
            <div className="liuyue-grid">
              {baziResult.liuyue.map((yue, index) => {
                const ganWuxing = getGanWuxing(yue.gan);
                const zhiWuxing = getZhiWuxing(yue.zhi);
                
                return (
                  <div key={index} className="liuyue-item">
                    <div className="liuyue-month">{yue.month}月</div>
                    <div className="liuyue-ganzhi">
                      <span style={{ color: getWuxingColor(ganWuxing) }}>{yue.gan}</span>
                      <span style={{ color: getWuxingColor(zhiWuxing) }}>{yue.zhi}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaziDetail;

