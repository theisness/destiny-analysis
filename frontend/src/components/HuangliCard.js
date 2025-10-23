import React, { useMemo } from 'react';
import './HuangliCard.css';
import { Solar, Lunar } from 'lunar-javascript';

function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }

function formatRelative(date) {
  const today = startOfDay(new Date());
  const diff = Math.round((startOfDay(date) - today) / 86400000);
  if (diff === 0) return '今天';
  if (diff > 0) return `${diff}天后`;
  return `${Math.abs(diff)}天前`;
}

const WEEK_NAMES = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

export default function HuangliCard({ date }) {
  const solar = useMemo(() => Solar.fromDate(date), [date]);
  const lunar = useMemo(() => Lunar.fromDate(date), [date]);

  const line1 = `${formatRelative(date)}  ${WEEK_NAMES[date.getDay()]}  ${solar.getYear()}年${String(solar.getMonth()).padStart(2,'0')}月`;
  const line2 = solar.getDay();
  const lunarMonth = lunar.getMonthInChinese();
  const lunarDay = lunar.getDayInChinese();
  const line3 = `农历${lunarMonth}月${lunarDay}`;
  const gzYear = lunar.getYearInGanZhi();
  const gzMonth = lunar.getMonthInGanZhi();
  const gzDay = lunar.getDayInGanZhi();
  const shengxiao = lunar.getYearShengXiao();
  const line4 = `${gzYear}年(${shengxiao}年)${gzMonth}月${gzDay}日`;

  const yi = (lunar.getDayYi?.() || []).join('、');
  const ji = (lunar.getDayJi?.() || []).join('、');

  const jq = lunar.getJieQi?.();
  const buddhistYear = solar.getYear() + 543; // 常用佛历纪年：BE = 公历年 + 543

  return (
    <div className="huangli-card">
      <div className="header">
        <div className="line1">{line1}</div>
        <div className="line2">{line2}</div>
        <div className="line3">{line3}{jq ? `　｜　${jq}` : ''}</div>
        <div className="line4">{line4}</div>
      </div>
      <div className="yiji">
        <div className="yiji-box">
          <div className="yiji-title yiji-good">宜</div>
          <div className="yiji-content">{yi || '——'}</div>
        </div>
        <div className="yiji-box">
          <div className="yiji-title yiji-bad">忌</div>
          <div className="yiji-content">{ji || '——'}</div>
        </div>
      </div>
      <div className="buddhist-line">佛历：{buddhistYear}年</div>
    </div>
  );
}