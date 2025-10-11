import React from 'react';
import './WuxingDisplay.css';

const WuxingDisplay = ({ wuxing }) => {
  const wuxingData = [
    { name: '金', key: 'jin', color: '#FFD700' },
    { name: '木', key: 'mu', color: '#228B22' },
    { name: '水', key: 'shui', color: '#1E90FF' },
    { name: '火', key: 'huo', color: '#FF4500' },
    { name: '土', key: 'tu', color: '#8B4513' }
  ];

  const total = Object.values(wuxing).reduce((sum, val) => sum + val, 0);

  return (
    <div className="wuxing-display">
      <h3>五行分布</h3>
      <div className="wuxing-bars">
        {wuxingData.map(({ name, key, color }) => {
          const value = wuxing[key] || 0;
          const percentage = total > 0 ? (value / total) * 100 : 0;
          
          return (
            <div key={key} className="wuxing-item">
              <div className="wuxing-label">
                <span style={{ color }}>{name}</span>
                <span className="wuxing-value">{value.toFixed(1)}</span>
              </div>
              <div className="wuxing-bar-container">
                <div
                  className="wuxing-bar"
                  style={{
                    width: `${percentage}%`,
                    background: color
                  }}
                />
              </div>
              <span className="wuxing-percentage">{percentage.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WuxingDisplay;

