import React from 'react';
import { getGanWuxing, getZhiWuxing, getWuxingColor } from '../utils/wuxing-calculator';
import { getShishen, getShishenColor } from '../utils/shishen-calculator';

const LiuyueCard = ({
  liuyueData = [],
  selectedYear,
  currentLunarInfo,
  baziResult
}) => {
  const riGan = baziResult?.dayPillar?.gan;

  return (
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
          const ganShishen = getShishen(riGan, yue.gan);
          return (
            <div key={index} className={`liuyue-item ${yue.isCurrent ? 'current' : ''}`}>
              <div className="liuyue-month">{yue.month}月</div>
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
  );
};

export default LiuyueCard;