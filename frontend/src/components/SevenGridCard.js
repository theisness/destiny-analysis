import './SevenGridCard.css'
import React from 'react';
import { getGanWuxing, getZhiWuxing, getWuxingColor } from '../utils/wuxing-calculator';
import { getShishen , getShishenColorBySource } from '../utils/shishen-calculator';
import { calculateDiShi, calculateNaYin, getDiShiColor, getNaYinColor, getZhiBenQi, getZhiCangGan } from '../utils/bazi-utils';

const SevenGridCard = ({
  baziResult,
  dayunData,
  liunianData,
  liuyueData,
  diShiData,
  naYinData,
  selectedYear,
  currentYear,
  frontendHiddenGan = {},
  titleExtra
}) => {
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
        <h2>综合排盘（七列）</h2>
        {titleExtra}
      </div>
      <div className="seven-grid">
        {/* 大运列 */}
        <div className="seven-col divider">
          <div className="col-title">大运</div>
          {(() => {
            const list = dayunData?.dayunList || [];
            const curYear = currentYear || new Date().getFullYear();
            let cur = null;
            for (let i = 0; i < list.length; i++) {
              const sY = list[i]?.startYear;
              const nextSY = list[i + 1]?.startYear;
              if (sY && curYear >= sY && (i === list.length - 1 || (nextSY && curYear < nextSY))) {
                cur = list[i];
                break;
              }
            }
            if (!cur) cur = list[0] || null;
            if (!cur) return <div>暂无</div>;
            const ganWuxing = getGanWuxing(cur.gan);
            const zhiWuxing = getZhiWuxing(cur.zhi);
            const ganSS = getShishen(riGan, cur.gan);
            const zhiBenQi = getZhiBenQi(cur.zhi);
            const zhiSS = zhiBenQi ? getShishen(riGan, zhiBenQi) : '';
            const dishi = calculateDiShi(cur.gan, cur.zhi);
            const nayin = calculateNaYin(cur.gan, cur.zhi);
            console.log('cur: ', cur)
            return (
              <>
                <div className="pillar-chars">
                  {ganSS && <div className="shishen-label" style={{ color: getShishenColorBySource(ganSS, cur.gan) }}>{ganSS}</div>}
                  <div className="char" style={{ color: getWuxingColor(ganWuxing) }}>{cur.gan}</div>
                  <div className="char" style={{ color: getWuxingColor(zhiWuxing) }}>{cur.zhi}</div>
                </div>
                {renderHiddenList(cur.zhi)}
                {dishi && <div className="dishi-label" style={{ color: getDiShiColor(dishi) }}>{dishi}</div>}
                {nayin && <div className="nayin-label" style={{ color: getNaYinColor(nayin) }}>{nayin}</div>}
              </>
            );
          })()}
        </div>

        {/* 流年列 */}
        <div className="seven-col divider">
          <div className="col-title">流年</div>
          {(() => {
            const cur = liunianData?.find(n => n.isCurrent) || liunianData?.find(n => n.year === selectedYear) || null;
            if (!cur) return <div>暂无</div>;
            const ganWuxing = getGanWuxing(cur.gan);
            const zhiWuxing = getZhiWuxing(cur.zhi);
            const ganSS = getShishen(riGan, cur.gan);
            const zhiBenQi = getZhiBenQi(cur.zhi);
            const zhiSS = zhiBenQi ? getShishen(riGan, zhiBenQi) : '';
            const dishi = calculateDiShi(cur.gan, cur.zhi);
            const nayin = calculateNaYin(cur.gan, cur.zhi);
            return (
              <>
                <div className="pillar-chars">
                  {ganSS && <div className="shishen-label" style={{ color: getShishenColorBySource(ganSS, cur.gan) }}>{ganSS}</div>}
                  <div className="char" style={{ color: getWuxingColor(ganWuxing) }}>{cur.gan}</div>
                  <div className="char" style={{ color: getWuxingColor(zhiWuxing) }}>{cur.zhi}</div>
                </div>
                {renderHiddenList(cur.zhi)}
                {dishi && <div className="dishi-label" style={{ color: getDiShiColor(dishi) }}>{dishi}</div>}
                {nayin && <div className="nayin-label" style={{ color: getNaYinColor(nayin) }}>{nayin}</div>}
              </>
            );
          })()}
        </div>

        {/* 流月列 */}
        <div className="seven-col divider">
          <div className="col-title">流月</div>
          {(() => {
            const cur = liuyueData?.find(m => m.isCurrent) || liuyueData?.[0] || null;
            if (!cur) return <div>暂无</div>;
            const ganWuxing = getGanWuxing(cur.gan);
            const zhiWuxing = getZhiWuxing(cur.zhi);
            const ganSS = getShishen(riGan, cur.gan);
            const zhiBenQi = getZhiBenQi(cur.zhi);
            const zhiSS = zhiBenQi ? getShishen(riGan, zhiBenQi) : '';
            const dishi = calculateDiShi(cur.gan, cur.zhi);
            const nayin = calculateNaYin(cur.gan, cur.zhi);
            return (
              <>
                <div className="pillar-chars">
                  {ganSS && <div className="shishen-label" style={{ color: getShishenColorBySource(ganSS, cur.gan) }}>{ganSS}</div>}
                  <div className="char" style={{ color: getWuxingColor(ganWuxing) }}>{cur.gan}</div>
                  <div className="char" style={{ color: getWuxingColor(zhiWuxing) }}>{cur.zhi}</div>
                </div>
                {renderHiddenList(cur.zhi)}
                {dishi && <div className="dishi-label" style={{ color: getDiShiColor(dishi) }}>{dishi}</div>}
                {nayin && <div className="nayin-label" style={{ color: getNaYinColor(nayin) }}>{nayin}</div>}
              </>
            );
          })()}
        </div>

        {/* 四柱列：年/月/日/时 */}
        {['year', 'month', 'day', 'hour'].map((pillar) => {
          const pillarLabel = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' }[pillar];
          const pillarData = baziResult[`${pillar}Pillar`] || {};
          const gan = pillarData.gan || '';
          const zhi = pillarData.zhi || '';
          const ganWuxing = getGanWuxing(gan);
          const zhiWuxing = getZhiWuxing(zhi);
          const ganSS = getShishen(riGan, gan, pillar === 'day');
          const zhiBenQi = getZhiBenQi(zhi);
          const zhiSS = zhiBenQi ? getShishen(riGan, zhiBenQi) : '';
          const dishi = diShiData?.[pillar];
          const nayin = naYinData?.[pillar];
          const hiddenList = frontendHiddenGan?.[pillar] || [];
          return (
            <div key={pillar} className="seven-col">
              <div className="col-title">{pillarLabel}</div>
              <div className="pillar-chars">
                {ganSS && <div className="shishen-label" style={{ color: getShishenColorBySource(ganSS, gan) }}>{ganSS}</div>}
                <div className="char" style={{ color: getWuxingColor(ganWuxing) }}>{gan}</div>
                <div className="char" style={{ color: getWuxingColor(zhiWuxing) }}>{zhi}</div>
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

export default SevenGridCard;