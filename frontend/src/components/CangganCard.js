import './CangganCard.css'
import React from 'react';
import { getGanWuxing, getWuxingColor } from '../utils/wuxing-calculator';
import { getShishen, getShishenColor } from '../utils/shishen-calculator';

const CangganCard = ({ baziResult, shenshaData }) => {
  if (!baziResult) return null;
  const riGan = baziResult.dayPillar?.gan;

  return (
    <div className="card">
      <h2>神煞</h2>
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