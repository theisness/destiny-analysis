import './LiunianCard.css'
import React, { useEffect, useRef } from 'react';
import { getGanWuxing, getZhiWuxing, getWuxingColor } from '../utils/wuxing-calculator';
import { getShishen, getShishenColorBySource, abbrShishen } from '../utils/shishen-calculator';
import { getZhiBenQi, calculateDiShi, calculateNaYin, getDiShiColor, getNaYinColor } from '../utils/bazi-utils';

const LiunianCard = ({
  liunianData = [],
  selectedYear,
  currentYear,
  onPrevDecade,
  onNextDecade,
  onSetYear,
  onToday,
  baziResult
}) => {
  const riGan = baziResult?.dayPillar?.gan;
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 576;
  const gridRef = useRef(null);

  // 初始化时自动定位到当前流年（居中显示）
  useEffect(() => {
    const container = gridRef.current;
    if (!container) return;
    const currentEl = container.querySelector('.liunian-item.current');
    if (currentEl) {
      const target = currentEl.offsetLeft - container.clientWidth / 2 + currentEl.clientWidth / 2;
      container.scrollLeft = Math.max(target, 0);
    }
  }, [liunianData, selectedYear, currentYear]);

  return (
    <div className="card">
      <h2>流年排盘</h2>
      <div className="card-header-with-control">
        <div className="year-selector">
          <button className="year-nav-btn" onClick={onPrevDecade}>←</button>
          <select
            value={selectedYear}
            onChange={(e) => onSetYear(parseInt(e.target.value))}
            className="year-select"
          >
            {Array.from({ length: 100 }, (_, i) => currentYear - 50 + i).map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
          <button className="year-nav-btn" onClick={onNextDecade}>→</button>
          <button className="btn-today" onClick={onToday}>今年</button>
        </div>
      </div>
      <div className="liunian-grid" ref={gridRef}>
        {liunianData.map((nian, index) => {
          const ganWuxing = getGanWuxing(nian.gan);
          const zhiWuxing = getZhiWuxing(nian.zhi);
          const ganShishen = getShishen(riGan, nian.gan);
          const zhiBenQi = getZhiBenQi(nian.zhi);
          const zhiShishen = zhiBenQi ? getShishen(riGan, zhiBenQi) : '';
          const dishi = calculateDiShi(riGan, nian.zhi);
          const nayin = calculateNaYin(nian.gan, nian.zhi);
          return (
            <div key={index} className={`liunian-item ${nian.isCurrent ? 'current' : ''}`}>
              <div className="liunian-year">{nian.year}</div>

              <div className="liunian-ganzhi-container">
                <div className="liunian-gan-section">
                  {ganShishen && (
                    <div className="liunian-gan-shishen" style={{ color: getShishenColorBySource(ganShishen, nian.gan) }}>
                      {isMobile ? abbrShishen(ganShishen) : ganShishen}
                    </div>
                  )}
                  <span className="liunian-gan" style={{ color: getWuxingColor(ganWuxing) }}>
                    {nian.gan}
                  </span>
                </div>

                <div className="liunian-zhi-section">
                  {zhiShishen && (
                    <div className="liunian-zhi-shishen" style={{ color: getShishenColorBySource(zhiShishen, zhiBenQi) }}>
                      {isMobile ? abbrShishen(zhiShishen) : zhiShishen}
                    </div>
                  )}
                  <span className="liunian-zhi" style={{ color: getWuxingColor(zhiWuxing) }}>
                    {nian.zhi}
                  </span>
                </div>
              </div>

              <div className="liunian-meta">
                {dishi && (
                  <div className="liunian-dishi tag-pill" style={{ color: getDiShiColor(dishi) }}>
                    {dishi}
                  </div>
                )}

                {nayin && (
                  <div className="liunian-nayin tag-pill" style={{ color: getNaYinColor(nayin) }}>
                    {nayin}
                  </div>
                )}
              </div>

              {nian.isCurrent && <div className="current-badge">当前</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiunianCard;