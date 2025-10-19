import './ShenShaCard.css'
import React from 'react';

const CATEGORY_ORDER = [
  '贵人类（吉神）',
  '福禄类（吉神）',
  '文昌类（吉神）',
  '武勇类（吉神）',
  '桃花类（吉凶皆有）',
  '凶煞类（凶神）',
  '刑害冲破类（凶神）',
  '天象类（吉凶参半）'
];

const ShenShaCard = ({ baziResult, shenshaData }) => {
  if (!baziResult) return null;
  const hasAny = shenshaData && typeof shenshaData === 'object' && Object.values(shenshaData).some(arr => (arr || []).length > 0);

  return (
    <div className="card">
      <h2>✨神煞</h2>
      {hasAny ? (
        <div className="shensha-categories">
          {CATEGORY_ORDER.map((cat) => {
            const items = (shenshaData && shenshaData[cat]) || [];
            if (!items.length) return null;
            return (
              <div key={cat} className="shensha-category">
                <div className="category-title">{cat}</div>
                <div className="category-badges">
                  {items.map((sha, idx) => (
                    <span key={`${cat}-${idx}`} className="shensha-badge">{sha}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="shensha-empty">暂无神煞信息</div>
      )}
    </div>
  );
};

export default ShenShaCard;