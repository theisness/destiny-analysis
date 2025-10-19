import React, { useEffect, useState } from 'react';
import './WuxingDisplay.css';
import { getWuxingColor } from '../utils/wuxing-calculator';

const WuxingDisplay = ({ wuxing }) => {
  const wuxingData = [
    { name: '金', key: 'jin' },
    { name: '木', key: 'mu' },
    { name: '水', key: 'shui' },
    { name: '火', key: 'huo' },
    { name: '土', key: 'tu' }
  ];

  const total = Object.values(wuxing).reduce((sum, val) => sum + val, 0);
  const maxVal = Math.max(0, ...Object.values(wuxing));

  // 移动端检测：宽度<=576px时按最大值归一化到100%
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mql = window.matchMedia('(max-width: 576px)');
      const update = () => setIsMobile(mql.matches);
      update();
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    }
  }, []);

  // 计算每个五行元素的百分比并按降序排序
  const sortedWuxingData = [...wuxingData].sort((a, b) => {
    const valueA = wuxing[a.key] || 0;
    const valueB = wuxing[b.key] || 0;
    return valueB - valueA; // 降序排列
  });

  return (
    <div className="wuxing-display">
      <h3>五行分布</h3>
      <div className="wuxing-bars">
        {sortedWuxingData.map(({ name, key }) => {
          const value = wuxing[key] || 0;
          const percentTotal = total > 0 ? (value / total) * 100 : 0;
          const percentMax = maxVal > 0 ? (value / maxVal) * 100 : 0;
          const color = getWuxingColor(name);
          const widthPercent = isMobile ? percentMax : percentTotal;
          return (
            <div key={key} className="wuxing-item">
              <div className="wuxing-label">
                <span style={{ color }}>{name}</span>
                <span className="wuxing-value">{value.toFixed(2)}</span>
              </div>
              <div className="wuxing-bar-container">
                <div
                  className="wuxing-bar"
                  style={{
                    width: `${widthPercent}%`,
                    background: color
                  }}
                />
              </div>
              <span className="wuxing-percentage">{percentTotal.toFixed(2)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WuxingDisplay;

