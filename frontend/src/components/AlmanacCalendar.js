import React, { useMemo } from 'react';
import './AlmanacCalendar.css';
import { Solar, Lunar } from 'lunar-javascript';

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return x;
}

function buildMonthGrid(year, month) {
  // month: 1-12
  const first = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0).getDate();
  // JS getDay: Sunday=0..Saturday=6, we need Monday-first
  const dow = first.getDay();
  const leading = (dow === 0 ? 6 : dow - 1); // number of days from previous month to fill
  const totalCells = 42; // 6 rows * 7 cols

  const cells = [];
  // previous month start date
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevLast = new Date(prevYear, prevMonth, 0).getDate();

  for (let i = 0; i < leading; i++) {
    const day = prevLast - leading + 1 + i;
    const date = new Date(prevYear, prevMonth - 1, day);
    const lunar = Lunar.fromDate(date);
    cells.push({ date, inMonth: false, solarDay: day, lunarDay: lunar.getDayInChinese(), jieqi: lunar.getJieQi() || null, festivals: (lunar.getFestivals?.() || []).map(f => f.toString?.() || f) });
  }

  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month - 1, d);
    const lunar = Lunar.fromDate(date);
    cells.push({ date, inMonth: true, solarDay: d, lunarDay: lunar.getDayInChinese(), jieqi: lunar.getJieQi() || null, festivals: (lunar.getFestivals?.() || []).map(f => f.toString?.() || f) });
  }

  const trailing = totalCells - cells.length;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  for (let i = 1; i <= trailing; i++) {
    const date = new Date(nextYear, nextMonth - 1, i);
    const lunar = Lunar.fromDate(date);
    cells.push({ date, inMonth: false, solarDay: i, lunarDay: lunar.getDayInChinese(), jieqi: lunar.getJieQi() || null, festivals: (lunar.getFestivals?.() || []).map(f => f.toString?.() || f) });
  }

  return cells;
}

export default function AlmanacCalendar({ date, onDateChange }) {
  const viewYear = date.getFullYear();
  const viewMonth = date.getMonth() + 1;
  const today = startOfDay(new Date());
  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const years = Array.from({ length: 201 }, (_, i) => 1900 + i); // 1900-2100
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handlePick = (d) => {
    onDateChange?.(d);
  };

  const handleYearChange = (e) => {
    const y = parseInt(e.target.value, 10);
    const newDate = new Date(y, viewMonth - 1, Math.min(date.getDate(), new Date(y, viewMonth, 0).getDate()));
    onDateChange?.(newDate);
  };
  const handleMonthChange = (e) => {
    const m = parseInt(e.target.value, 10);
    const newDate = new Date(viewYear, m - 1, Math.min(date.getDate(), new Date(viewYear, m, 0).getDate()));
    onDateChange?.(newDate);
  };

  return (
    <div className="almanac-calendar">
      <div className="calendar-header">
        <div className="selectors">
          <select value={viewYear} onChange={handleYearChange}>
            {years.map(y => <option key={y} value={y}>{y}年</option>)}
          </select>
          <select value={viewMonth} onChange={handleMonthChange}>
            {months.map(m => <option key={m} value={m}>{m}月</option>)}
          </select>
        </div>
      </div>

      <div className="week-row">
        {WEEK_LABELS.map(w => <div key={w} className="week-cell">周{w}</div>)}
      </div>

      <div className="grid">
        {grid.map((cell, idx) => {
          const isToday = startOfDay(cell.date).getTime() === today.getTime();
          const isSelected = startOfDay(cell.date).getTime() === startOfDay(date).getTime();
          const classes = ['day-cell'];
          if (!cell.inMonth) classes.push('dimmed');
          if (isToday) classes.push('today');
          if (isSelected) classes.push('selected');
          const festival = Array.isArray(cell.festivals) && cell.festivals.length > 0 ? cell.festivals[0] : null;
          const infoText = festival || cell.jieqi || cell.lunarDay;
          return (
            <div key={idx} className={classes.join(' ')} onClick={() => handlePick(cell.date)}>
              <div className="solar-day">{cell.solarDay}</div>
              <div className="minor-text">{infoText}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}