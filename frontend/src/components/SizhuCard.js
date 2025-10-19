import './SizhuCard.css'
import React from 'react';
import { getGanWuxing, getZhiWuxing, getWuxingColor } from '../utils/wuxing-calculator';
import { getShishen , getShishenColorBySource } from '../utils/shishen-calculator';
import { getDiShiColor, getNaYinColor, getZhiBenQi, getZhiCangGan } from '../utils/bazi-utils';

const SizhuCard = ({ baziResult, diShiData, naYinData }) => {
  if (!baziResult) return null;
  const riGan = baziResult.dayPillar?.gan;

  return (
    <div className="card">
      <h2>四柱八字</h2>
      <div className="sizhu-display-detail">
        {['year', 'month', 'day', 'hour'].map((pillar) => {
          const pillarName = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' }[pillar];
          const pillarData = baziResult[`${pillar}Pillar`];
          const ganWuxing = getGanWuxing(pillarData.gan);
          const zhiWuxing = getZhiWuxing(pillarData.zhi);
          const isDayGan = pillar === 'day';
          const ganShishen = getShishen(riGan, pillarData.gan, isDayGan);
          const zhiBenQi = getZhiBenQi(pillarData.zhi);
          const zhiShishen = zhiBenQi ? getShishen(riGan, zhiBenQi) : '';
          const dishi = diShiData?.[pillar];
          const nayin = naYinData?.[pillar];
          const hiddenList = getZhiCangGan(pillarData.zhi) || [];
          const paddedHidden = [...hiddenList, ...Array(Math.max(0, 3 - hiddenList.length)).fill(null)];

          return (
            <div key={pillar} className="pillar-detail">
              <div className="pillar-name">{pillarName}</div>
              <div className="pillar-chars">
                {ganShishen && (
                  <div className="shishen-label" style={{ color: getShishenColorBySource(ganShishen, pillarData.gan) }}>
                    {ganShishen}
                  </div>
                )}
                <span className="char gan" style={{ color: getWuxingColor(ganWuxing) }}>
                  {pillarData.gan}
                </span>
                <span className="char zhi" style={{ color: getWuxingColor(zhiWuxing) }}>
                  {pillarData.zhi}
                </span>


              {/* 藏干与十神（按三位对齐，无值占位） */}
              <div className="hidden-gans">
                {paddedHidden.map((g, index) => {
                  if (!g) {
                    return (
                      <div key={`empty-${pillar}-${index}`} className="hidden-gan-item" style={{ visibility: 'hidden' }}>
                        <span className="gan">-</span>
                        <span className="shishen">-</span>
                        <span className="label">（-）</span>
                      </div>
                    );
                  }
                  const ss = getShishen(riGan, g);
                  return (
                    <div key={`${pillar}-hidden-${index}`} className="hidden-gan-item">
                      <span className="gan" style={{ color: getWuxingColor(getGanWuxing(g)) }}>{g}</span>
                      <span className="shishen" style={{ color: getShishenColorBySource(ss, g) }}>{ss}</span>
                    </div>
                  );
                })}
              </div>
                  {dishi && (
                      <div className="dishi-label" style={{ color: getDiShiColor(dishi) }}>
                          {dishi}
                      </div>
                  )}
              </div>
                {nayin && (
                    <div className="nayin-label" style={{ color: getNaYinColor(nayin) }}>
                        {nayin}
                    </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SizhuCard;