import React from 'react';
import { getGanWuxing, getWuxingColor } from '../utils/wuxing-calculator';
import { getShishen, getShishenColor } from '../utils/shishen-calculator';

const CangganCard = ({ baziResult, shenshaData }) => {
  if (!baziResult) return null;
  const riGan = baziResult.dayPillar?.gan;

  return (
    <div className="card">
      <h2>地支藏干</h2>
      <div className="canggan-grid">
        {['year', 'month', 'day', 'hour'].map((pillar) => {
          const pillarName = { year: '年支', month: '月支', day: '日支', hour: '时支' }[pillar];
          const pillarData = baziResult[`${pillar}Pillar`];
          const hiddenGans = baziResult.hiddenGan?.[pillar] || [];

          return (
            <div key={pillar} className="canggan-item">
              <div className="canggan-label">
                {pillarName}（{pillarData.zhi}）
              </div>
              <div className="canggan-values">
                {hiddenGans.map((gan, index) => {
                  const wuxing = getGanWuxing(gan);
                  const shishen = getShishen(riGan, gan);
                  return (
                    <div key={index} className="canggan-item-detail">
                      <span className="canggan-gan" style={{ color: getWuxingColor(wuxing) }}>
                        {gan}
                      </span>
                      <span className="canggan-wuxing">({wuxing})</span>
                      <div className="canggan-shishen" style={{ color: getShishenColor(shishen) }}>
                        {shishen}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {shenshaData && shenshaData.length > 0 && (
        <div className="shensha-section">
          <h3>神煞</h3>
          <div className="shensha-list">
            {shenshaData.map((sha, index) => (
              <span key={index} className="shensha-badge">{sha}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CangganCard;