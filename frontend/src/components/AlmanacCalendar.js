import React, { useMemo, useState, useEffect } from 'react';
import './AlmanacCalendar.css';
import { Solar, Lunar } from 'lunar-javascript';

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return x;
}

// 常见节日（阳历）
const SOLAR_HOLIDAYS = {
  '1-1': '元旦',
  '5-1': '劳动节',
  '10-1': '国庆',
  '10-31': '万圣节',
  '12-25': '圣诞节'
};

// 休假标记（用于右上角“休”）
const REST_HOLIDAYS = new Set(['春节','清明','劳动节','端午','中秋','国庆','元旦']);

function getFestivalLabel(date, lunar) {
  const key = `${date.getMonth()+1}-${date.getDate()}`;
  if (SOLAR_HOLIDAYS[key]) return SOLAR_HOLIDAYS[key];
  const lm = lunar.getMonth();
  const ld = lunar.getDay();
  if (lm === 1 && ld === 1) return '春节';
  if (lm === 1 && ld === 15) return '元宵';
  if (lm === 5 && ld === 5) return '端午';
  if (lm === 7 && ld === 7) return '七夕';
  if (lm === 8 && ld === 15) return '中秋';
  if (lm === 9 && ld === 9) return '重阳';
  const libFest = (lunar.getFestivals?.() || []).map(f => f.toString?.() || f);
  return libFest.length > 0 ? libFest[0] : null;
}

function isRestHoliday(festival, jieqi) {
  return (festival && REST_HOLIDAYS.has(festival)) || jieqi === '清明';
}

// 格式化为 YYYY-MM-DD（本地时区）
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 获取某年的法定节假日与调休上班信息（优先从 timor.tech，失败则空集）
const holidayYearCache = new Map();
async function fetchYearHolidayMap(year, signal) {
  if (holidayYearCache.has(year)) return holidayYearCache.get(year);
  try {
    const resp = await fetch(`https://timor.tech/api/holiday/year/${year}`, { signal });
    if (!resp.ok) throw new Error('holiday api http error');
    const data = await resp.json();
    const items = data?.holiday || {};
    const map = {};
    // 规范化：{ 'YYYY-MM-DD': { type: 'rest' | 'work', name?: string } }
    Object.keys(items).forEach((k) => {
      const it = items[k] || {};
      // timor 返回结构可能包含 holiday/workday/name 等，不同年份结构会有差异，这里尽量鲁棒
      const name = it.name || it.holiday?.name || undefined;
      const isHoliday = it.holiday === true || it.isOffDay === true || it.type === 2 || it?.holiday?.holiday === true;
      const isWorkday = it.holiday === false || it.type === 0 && /调休|班/.test(name || '');
      if (isHoliday) {
        map[k] = { type: 'rest', name };
      } else if (isWorkday) {
        map[k] = { type: 'work', name: name || '调休上班' };
      } else {
        // 普通工作日/周末不做任何角标显示
      }
    });
    console.log('holiday api response:', map);
    holidayYearCache.set(year, map);
    return map;
  } catch (e) {
    console.warn('holiday api failed or unsupported, fallback to empty map', e);
    const empty = {};
    holidayYearCache.set(year, empty);
    return empty;
  }
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
    const jq = lunar.getJieQi() || null;
    const fest = getFestivalLabel(date, lunar);
    const rest = isRestHoliday(fest, jq);
    cells.push({ date, inMonth: false, solarDay: day, lunarDay: lunar.getDayInChinese(), jieqi: jq, festival: fest, rest });
  }

  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month - 1, d);
    const lunar = Lunar.fromDate(date);
    const jq = lunar.getJieQi() || null;
    const fest = getFestivalLabel(date, lunar);
    const rest = isRestHoliday(fest, jq);
    cells.push({ date, inMonth: true, solarDay: d, lunarDay: lunar.getDayInChinese(), jieqi: jq, festival: fest, rest });
  }

  const trailing = totalCells - cells.length;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  for (let i = 1; i <= trailing; i++) {
    const date = new Date(nextYear, nextMonth - 1, i);
    const lunar = Lunar.fromDate(date);
    const jq = lunar.getJieQi() || null;
    const fest = getFestivalLabel(date, lunar);
    const rest = isRestHoliday(fest, jq);
    cells.push({ date, inMonth: false, solarDay: i, lunarDay: lunar.getDayInChinese(), jieqi: jq, festival: fest, rest });
  }

  return cells;
}

export default function AlmanacCalendar({ date, onDateChange }) {
  const viewYear = date.getFullYear();
  const viewMonth = date.getMonth() + 1;
  const today = startOfDay(new Date());
  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const [holidayMap, setHolidayMap] = useState({});
  useEffect(() => {
    const ctrl = new AbortController();
    fetchYearHolidayMap(viewYear, ctrl.signal).then(setHolidayMap).catch(() => setHolidayMap({}));
    return () => ctrl.abort();
  }, [viewYear]);

  const years = Array.from({ length: 201 }, (_, i) => 1900 + i); // 1900-2100
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handlePick = (d) => {
    onDateChange?.(d);
  };

  const clampDay = (y, m, d) => Math.min(d, new Date(y, m, 0).getDate());
  const prevYear = () => {
    const y = viewYear - 1;
    const newDate = new Date(y, viewMonth - 1, clampDay(y, viewMonth, date.getDate()));
    onDateChange?.(newDate);
  };
  const nextYear = () => {
    const y = viewYear + 1;
    const newDate = new Date(y, viewMonth - 1, clampDay(y, viewMonth, date.getDate()));
    onDateChange?.(newDate);
  };
  const prevMonth = () => {
    const target = new Date(viewYear, viewMonth - 2, 1);
    const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    const newDate = new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), last));
    onDateChange?.(newDate);
  };
  const nextMonth = () => {
    const target = new Date(viewYear, viewMonth, 1);
    const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    const newDate = new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), last));
    onDateChange?.(newDate);
  };
  const goToday = () => onDateChange?.(new Date());

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
          <div className="selector">
            <button className="nav-btn" onClick={prevYear}>‹</button>
            <select value={viewYear} onChange={handleYearChange}>
              {years.map(y => <option key={y} value={y}>{y}年</option>)}
            </select>
            <button className="nav-btn" onClick={nextYear}>›</button>
          </div>
          <div className="selector">
            <button className="nav-btn" onClick={prevMonth}>‹</button>
            <select value={viewMonth} onChange={handleMonthChange}>
              {months.map(m => <option key={m} value={m}>{m}月</option>)}
            </select>
            <button className="nav-btn" onClick={nextMonth}>›</button>
          </div>
        </div>
          <button className="btn-today" onClick={goToday}>今天</button>
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

          const labelType = cell.festival ? 'festival' : (cell.jieqi ? 'jieqi' : 'lunar');
          const labelText = cell.festival || cell.jieqi || cell.lunarDay;
          // key格式：MM-dd
          const key = `${String(cell.date.getMonth() + 1).padStart(2, '0')}-${String(cell.date.getDate()).padStart(2, '0')}`;
          const hol = holidayMap[key];
          const cornerType = hol?.type; // 'rest' | 'work' | undefined
          return (
            <div key={idx} className={classes.join(' ')} onClick={() => handlePick(cell.date)}>
              {cornerType && (
                <div className={`corner ${cornerType === 'rest' ? 'corner-rest' : 'corner-work'}`}>
                  {cornerType === 'rest' ? '休' : '班'}
                </div>
              )}
              <div className="solar-day">{cell.solarDay}</div>
              <div className={`minor-text ${labelType === 'festival' ? 'text-festival' : (labelType === 'jieqi' ? 'text-jieqi' : '')}`}>{labelText}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}