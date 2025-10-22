import './LiuyueCard.css'
import React, { useEffect, useRef } from 'react';
import { getGanWuxing, getZhiWuxing, getWuxingColor } from '../utils/wuxing-calculator';
import { getShishen, getShishenColorBySource, abbrShishen } from '../utils/shishen-calculator';

const LiuyueCard = ({
  liuyueData = [],
  selectedYear,
  currentLunar,
  baziResult
}) => {
  const riGan = baziResult?.dayPillar?.gan;
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 576;
  const gridRef = useRef(null);

  // 初始化时自动定位到当前流月（居中显示）
  useEffect(() => {
    const container = gridRef.current;
    if (!container) return;
    const currentEl = container.querySelector('.liuyue-item.current');
    if (currentEl) {
      const target = currentEl.offsetLeft - container.clientWidth / 2 + currentEl.clientWidth / 2;
      container.scrollLeft = Math.max(target, 0);
    }
  }, [liuyueData, selectedYear]);

  return (
    <div className="card">
      <h2>流月排盘（{selectedYear}年）</h2>
      <p className="liuyue-hint">
        💡 五虎遁月诀：甲己之年丙作首，乙庚之岁戊为头，丙辛必定寻庚起，丁壬壬位顺行流，戊癸甲寅好追求
        {selectedYear === currentLunar.getYear() && (
          <span className="current-lunar-info">
            （当前：农历{Math.abs(currentLunar.getMonth())}月 - {currentLunar.getMonthInGanZhi()}）
          </span>
        )}
      </p>
      <div className="liuyue-grid" ref={gridRef}>
        {liuyueData.map((yue, index) => {
          const ganWuxing = getGanWuxing(yue.gan);
          const zhiWuxing = getZhiWuxing(yue.zhi);
          const ganShishen = getShishen(riGan, yue.gan);
          return (
            <div key={index} className={`liuyue-item ${yue.isCurrent ? 'current' : ''}`}>
              <div className="liuyue-month">{yue.month}月</div>
              <div className="liuyue-shishen" style={{ color: getShishenColorBySource(ganShishen, yue.gan) }}>
                {isMobile ? abbrShishen(ganShishen) : ganShishen}
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