import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import WuxingDisplay from '../../components/WuxingDisplay';
import { baziAPI } from '../../api/api';
import { usersAPI } from '../../api/api';
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
  getShishenColorBySource
} from '../../utils/shishen-calculator';
import {
  TIAN_GAN,
  DI_ZHI,
  calculateLiunian,
  calculateLiuyue,
  formatDate
} from '../../utils/liunian-calculator';
import { calculateShenshaCategorized } from '../../utils/shensha-calculator';
import './BaziDetail.css';
import SizhuCard from '../../components/SizhuCard';
import ShenShaCard from '../../components/ShenShaCard';
import SevenGridCard from '../../components/SevenGridCard';
import LiunianCard from '../../components/LiunianCard';
import LiuyueCard from '../../components/LiuyueCard';
import DayunCard from '../../components/DayunCard';
import ShareSettingsSection from '../../components/ShareSettingsSection';
import CommentsSection from '../../components/CommentsSection';
import { BASE_URL, DEFAULT_AVATAR } from '../../config';
import { useAuth } from '../../context/AuthContext';
import SecureImage from '../../components/SecureImage';
import TagSelect from '../../components/TagSelect';

const BaziDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publisher, setPublisher] = useState(null);

  const { user } = useAuth();
  const getAvatarSrc = (u) => (u?.avatarUrl ? `${BASE_URL}${u.avatarUrl}` : DEFAULT_AVATAR);

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
  const [shenshaData, setShenshaData] = useState({});

  // 前端计算的五行数据
  const [wuxingData, setWuxingData] = useState({ jin: 0, mu: 0, shui: 0, huo: 0, tu: 0 });
  const [frontendHiddenGan, setFrontendHiddenGan] = useState({});
  
  // 七列卡片显示控制：大运/流年/流月 勾选后显示
  const [showDayun, setShowDayun] = useState(false);
  const [showLiunian, setShowLiunian] = useState(false);
  const [showLiuyue, setShowLiuyue] = useState(false);
  // 在详情页新增：分享设置弹窗开关
  const [showShareSettingsModal, setShowShareSettingsModal] = useState(false);
  // 在详情页新增：标签管理弹窗开关与当前选择
  const [showLabelsModal, setShowLabelsModal] = useState(false);
  const [labelSelection, setLabelSelection] = useState([]);

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
      // 获取发布者信息
      if (recordData?.userId) {
        try {
          const uRes = await usersAPI.getById(recordData.userId);
          setPublisher(uRes.data.user);
        } catch (e) {
          // ignore
        }
      }
      
      // 前端计算藏干和五行比例
      if (recordData.baziResult) {
        const hiddenGan = calculateHiddenGan(recordData.baziResult);
        const wuxing = calculateWuxing(recordData.baziResult, hiddenGan);
        setFrontendHiddenGan(hiddenGan);
        setWuxingData(wuxing);
      }

      // 本地计算大运
      if (recordData.gregorianDate && recordData.gregorianDate.year) {
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
      
      // 本地计算神煞（分类）
      if (recordData.baziResult) {
        const baziResult = recordData.baziResult;
        const localShensha = calculateShenshaCategorized(
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

  // 标题栏勾选控制：大运/流年/流月
  const titleExtraControls = (
    <div className="year-selector" style={{ gap: 12 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={showDayun} onChange={(e) => setShowDayun(e.target.checked)} />
        <span>大运</span>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={showLiunian} onChange={(e) => setShowLiunian(e.target.checked)} />
        <span>流年</span>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={showLiuyue} onChange={(e) => setShowLiuyue(e.target.checked)} />
        <span>流月</span>
      </label>
    </div>
  );

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
              <span className="info-label">八字发布者：</span>
              <span className="info-value publisher-info">
                <Link to={publisher?._id ? `/users/${publisher._id}` : '#'} className="publisher-link">
                  <SecureImage className="avatar" src={getAvatarSrc(publisher)} alt="" />
                </Link>
                <Link to={publisher?._id ? `/users/${publisher._id}` : '#'} className="publisher-name">
                  {publisher?.nickname || publisher?.username || '—'}
                </Link>
              </span>
            </div>
            {/* 换行 */}
            <br />
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
            {Array.isArray(record.labels) && record.labels.length > 0 && (
              <div className="info-item" style={{ alignItems: 'flex-start' }}>
                <span className="info-label">标签：</span>
                <span className="info-value" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {record.labels.map(l => (
                    <span key={l._id || l.name} style={{
                      background: '#eef2ff', border: '1px solid #c7d2fe', color: '#3730a3',
                      padding: '2px 8px', borderRadius: 12, fontSize: 12
                    }}>{l.name || l}</span>
                  ))}
                </span>
              </div>
            )}
            {user && (record?.userId && user.id === record.userId) && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 0, gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => {
                  setLabelSelection(Array.isArray(record.labels) ? record.labels.map(l => l.name || l) : []);
                  setShowLabelsModal(true);
                }}>
                  标签管理
                </button>
                <button className="btn btn-primary" onClick={() => setShowShareSettingsModal(true)}>
                  分享设置
                </button>
              </div>
            )}
          </div>
        </div>

        
        {/* 七列综合排盘（仅七列卡片） */}
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
          titleExtra={titleExtraControls}
          showDayun={showDayun}
          showLiunian={showLiunian}
          showLiuyue={showLiuyue}
        />

        {/* 藏干 */}
        <ShenShaCard baziResult={baziResult} shenshaData={shenshaData} />

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

        <CommentsSection baziId={record._id} />

        {user && (record?.userId && user.id === record.userId) && showShareSettingsModal && (
          <div className="modal-backdrop" onClick={() => setShowShareSettingsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <span>分享设置</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowShareSettingsModal(false)}>关闭</button>
              </div>
              <ShareSettingsSection
                record={record}
                onUpdated={(data) => setRecord(prev => ({ ...prev, ...data }))}
              />
            </div>
          </div>
        )}

        {user && (record?.userId && user.id === record.userId) && showLabelsModal && (
          <div className="modal-backdrop" onClick={() => setShowLabelsModal(false)}>
            <div className="label-setting-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <span>标签管理</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowLabelsModal(false)}>关闭</button>
              </div>
              <div className="modal-content">
                <TagSelect
                  value={labelSelection}
                  onChange={(next) => setLabelSelection(next)}
                  placeholder="输入标签，按回车添加"
                  allowFreeText={true}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                  <button className="btn btn-secondary" onClick={() => setShowLabelsModal(false)}>取消</button>
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      try {
                        const res = await baziAPI.update(record._id, { labels: labelSelection });
                        const updated = res.data?.data || record;
                        setRecord(updated);
                        setShowLabelsModal(false);
                      } catch (err) {
                        alert(err.response?.data?.message || '保存标签失败');
                      }
                    }}
                  >保存</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BaziDetail;

