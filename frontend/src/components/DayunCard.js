import './DayunCard.css'
import React from 'react';
import { getGanWuxing, getZhiWuxing, getWuxingColor } from '../utils/wuxing-calculator';
import { getShishen, getShishenColorBySource } from '../utils/shishen-calculator';
import { getZhiBenQi, calculateDiShi, calculateNaYin, getDiShiColor, getNaYinColor } from '../utils/bazi-utils';

const DayunCard = ({
  dayunData = { dayunList: [], qiyunAge: { years: 0, months: 0, days: 0 } },
  baziResult,
  birthYear,
  currentYear
}) => {
  const riGan = baziResult?.dayPillar?.gan;
  const list = dayunData?.dayunList || [];

  return (
    <div className="card">
      <h2>大运排盘</h2>
      {dayunData.qiyunAge && (
        <div className="qiyun-info-box">
          <div className="qiyun-title">🕐 起运时间</div>
          <div className="qiyun-details">
            <span className="qiyun-value">
              {dayunData.qiyunAge.years}岁 {dayunData.qiyunAge.months}个月 {dayunData.qiyunAge.days}天
            </span>
            {birthYear && (
              <span className="qiyun-date">（约{birthYear + (dayunData.qiyunAge?.years || 0)}年起运）</span>
            )}
          </div>
        </div>
      )}
      <div className="dayun-grid">
        {list.map((yun, index) => {
          const ganWuxing = getGanWuxing(yun.gan);
          const zhiWuxing = getZhiWuxing(yun.zhi);

          // 判断是否是当前大运
          const currentAge = birthYear ? (currentYear - birthYear) : 0;
          const isCurrent = currentAge >= yun.age && (index === list.length - 1 || currentAge < list[index + 1]?.age);

          // 计算大运天干十神
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
                    <div className="dayun-gan-shishen" style={{ color: getShishenColorBySource(ganShishen, yun.gan) }}>
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
                    <div className="dayun-zhi-shishen" style={{ color: getShishenColorBySource(zhiShishen, zhiBenQi) }}>
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
  );
};

export default DayunCard;