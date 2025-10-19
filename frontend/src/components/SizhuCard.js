import './SizhuCard.css'
import React from 'react';
import { getGanWuxing, getZhiWuxing, getWuxingColor } from '../utils/wuxing-calculator';
import { getShishen , getShishenColorBySource } from '../utils/shishen-calculator';
import { getZhiBenQi, getZhiCangGan, getDiShiColor, getNaYinColor } from '../utils/bazi-utils';

const SizhuCard = ({ baziResult, diShiData, naYinData, frontendHiddenGan = {}, titleExtra }) => {
  if (!baziResult) return null;
  const riGan = baziResult.dayPillar?.gan;

  const renderHiddenList = (zhi) => {
    const hidden = getZhiCangGan(zhi) || [];
    const padded = [...hidden, ...Array(Math.max(0, 3 - hidden.length)).fill(null)];
    return (
      <div className="hidden-gans">
        {padded.map((g, index) => {
          if (!g) {
            return (
              <div key={`empty-${index}`} className="hidden-gan-item" style={{ visibility: 'hidden' }}>
                <span className="gan">-</span>
                <span className="shishen">-</span>
                <span className="label">（-）</span>
              </div>
            );
          }
          const ss = getShishen(riGan, g);
          return (
            <div key={index} className="hidden-gan-item">
              <span className="gan" style={{ color: getWuxingColor(getGanWuxing(g)) }}>{g}</span>
              <span className="shishen" style={{ color: getShishenColorBySource(ss, g) }}>{ss}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header-with-control">
        <h2>四柱八字</h2>
        {titleExtra}
      </div>
      <div className="sizhu-display-detail">
        {['year', 'month', 'day', 'hour'].map((pillar) => {
          const pillarName = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' }[pillar];
          const pillarData = baziResult[`${pillar}Pillar`] || {};
          const gan = pillarData.gan || '';
          const zhi = pillarData.zhi || '';
          const ganWuxing = getGanWuxing(gan);
          const zhiWuxing = getZhiWuxing(zhi);
          const ganSS = getShishen(riGan, gan, pillar === 'day');
          const zhiBenQi = getZhiBenQi(zhi);
          const zhiSS = zhiBenQi ? getShishen(riGan, zhiBenQi) : '';
          const hiddenList = frontendHiddenGan?.[pillar] || [];
          const dishi = diShiData?.[pillar];
          const nayin = naYinData?.[pillar];
          return (
            <div key={pillar} className="pillar-detail">
              <div className="pillar-name">{pillarName}</div>
              <div className="pillar-chars">
                {ganSS && <div className="shishen-label" style={{ color: getShishenColorBySource(ganSS, gan) }}>{ganSS}</div>}
                <span className="char" style={{ color: getWuxingColor(ganWuxing) }}>{gan}</span>
                <span className="char" style={{ color: getWuxingColor(zhiWuxing) }}>{zhi}</span>
              </div>
              <div className="hidden-gans">
                {([...hiddenList, ...Array(Math.max(0, 3 - hiddenList.length)).fill(null)]).map((g, index) => {
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
                    <div key={index} className="hidden-gan-item">
                      <span className="gan" style={{ color: getWuxingColor(getGanWuxing(g)) }}>{g}</span>
                      <span className="shishen" style={{ color: getShishenColorBySource(ss, g) }}>{ss}</span>
                    </div>
                  );
                })}
              </div>
              {dishi && <div className="dishi-label" style={{ color: getDiShiColor(dishi) }}>{dishi}</div>}
              {nayin && <div className="nayin-label" style={{ color: getNaYinColor(nayin) }}>{nayin}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SizhuCard;