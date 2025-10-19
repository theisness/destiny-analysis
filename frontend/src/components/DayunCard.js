import './DayunCard.css'
import React from 'react';
import { getGanWuxing, getZhiWuxing, getWuxingColor } from '../utils/wuxing-calculator';
import { getShishen, getShishenColorBySource, abbrShishen } from '../utils/shishen-calculator';
import { getZhiBenQi, calculateDiShi, calculateNaYin, getDiShiColor, getNaYinColor } from '../utils/bazi-utils';

const DayunCard = ({ dayunData, baziResult, birthYear, currentYear }) => {
  const riGan = baziResult?.dayPillar?.gan;
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 576;

  if (!dayunData || !dayunData.dayunList || dayunData.dayunList.length === 0) return null;

  return (
    <div className="card">
      {/* 起运信息 */}
      {dayunData.qiyun && (
        <div className="qiyun-info-box">
          <div className="qiyun-title">起运信息</div>
          <div className="qiyun-details">
            <div className="qiyun-value">起运年龄：{dayunData.qiyun.age}岁</div>
            <div className="qiyun-date">起运日期：{dayunData.qiyun.date}</div>
          </div>
        </div>
      )}

      {/* 大运列表 */}
      <div className="dayun-grid">
        {dayunData.dayunList.map((yun, index) => {
          const ganWuxing = getGanWuxing(yun.gan);
          const zhiWuxing = getZhiWuxing(yun.zhi);
          const ganShishen = getShishen(riGan, yun.gan);
          const zhiBenQi = getZhiBenQi(yun.zhi);
          const zhiShishen = zhiBenQi ? getShishen(riGan, zhiBenQi) : '';

          // 计算大运地势和纳音
          const dishi = calculateDiShi(yun.gan, yun.zhi);
          const nayin = calculateNaYin(yun.gan, yun.zhi);

          const isCurrent = currentYear >= yun.startYear && (index === dayunData.dayunList.length - 1 || currentYear < dayunData.dayunList[index + 1].startYear);

          return (
            <div key={index} className={`dayun-item ${isCurrent ? 'current' : ''}`}>
              <div className="dayun-age">{yun.age}岁</div>

              {/* 干支及十神 */}
              <div className="dayun-ganzhi-container">
                {/* 天干部分 */}
                <div className="dayun-gan-section">
                  {ganShishen && (
                    <div className="dayun-gan-shishen" style={{ color: getShishenColorBySource(ganShishen, yun.gan) }}>
                      {isMobile ? abbrShishen(ganShishen) : ganShishen}
                    </div>
                  )}
                  <span className="dayun-gan" style={{ color: getWuxingColor(ganWuxing) }}>
                    {yun.gan}
                  </span>
                </div>

                {/* 地支部分 */}
                <div className="dayun-zhi-section">
                  {zhiShishen && (
                    <div className="dayun-zhi-shishen" style={{ color: getShishenColorBySource(zhiShishen, zhiBenQi) }}>
                      {isMobile ? abbrShishen(zhiShishen) : zhiShishen}
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

              {/* 大运起运年份 */}
              <div className="dayun-year">
                起于 {yun.startYear} 年
              </div>

              {/* 当前标记 */}
              {isCurrent && <div className="current-badge">当前</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayunCard;