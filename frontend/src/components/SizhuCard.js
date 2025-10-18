import './SizhuCard.css'
import React from 'react';
import { getGanWuxing, getZhiWuxing, getWuxingColor } from '../utils/wuxing-calculator';
import { getShishen, getShishenColor } from '../utils/shishen-calculator';
import { getDiShiColor, getNaYinColor } from '../utils/bazi-utils';

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
          const dishi = diShiData?.[pillar];
          const nayin = naYinData?.[pillar];

          return (
            <div key={pillar} className="pillar-detail">
              <div className="pillar-name">{pillarName}</div>
              <div className="pillar-chars">
                {ganShishen && (
                  <div className="shishen-label" style={{ color: getShishenColor(ganShishen) }}>
                    {ganShishen}
                  </div>
                )}
                <span className="char gan" style={{ color: getWuxingColor(ganWuxing) }}>
                  {pillarData.gan}
                </span>
                <span className="char zhi" style={{ color: getWuxingColor(zhiWuxing) }}>
                  {pillarData.zhi}
                </span>
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