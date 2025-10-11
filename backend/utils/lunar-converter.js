const { Solar, Lunar } = require('lunar-javascript');

/**
 * 公历转农历
 * @param {number} year - 公历年
 * @param {number} month - 公历月
 * @param {number} day - 公历日
 * @param {number} hour - 小时
 * @param {number} minute - 分钟
 * @returns {Object} 农历日期对象
 */
const solarToLunar = (year, month, day, hour, minute) => {
  try {
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();
    
    return {
      year: lunar.getYear(),
      month: Math.abs(lunar.getMonth()), // 负数表示闰月
      day: lunar.getDay(),
      hour: hour,
      minute: minute,
      isLeapMonth: lunar.getMonth() < 0,
      yearInChinese: lunar.getYearInChinese(),
      monthInChinese: lunar.getMonthInChinese(),
      dayInChinese: lunar.getDayInChinese(),
      yearInGanZhi: lunar.getYearInGanZhi(),
      monthInGanZhi: lunar.getMonthInGanZhi(),
      dayInGanZhi: lunar.getDayInGanZhi(),
      timeInGanZhi: lunar.getTimeInGanZhi()
    };
  } catch (error) {
    throw new Error(`公历转农历失败: ${error.message}`);
  }
};

/**
 * 农历转公历
 * @param {number} year - 农历年
 * @param {number} month - 农历月
 * @param {number} day - 农历日
 * @param {number} hour - 小时
 * @param {number} minute - 分钟
 * @param {boolean} isLeapMonth - 是否闰月
 * @returns {Object} 公历日期对象
 */
const lunarToSolar = (year, month, day, hour, minute, isLeapMonth = false) => {
  try {
    const lunar = Lunar.fromYmd(year, isLeapMonth ? -month : month, day);
    const solar = lunar.getSolar();
    
    return {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      hour: hour,
      minute: minute
    };
  } catch (error) {
    throw new Error(`农历转公历失败: ${error.message}`);
  }
};

/**
 * 获取时辰（地支）
 * @param {number} hour - 小时 (0-23)
 * @returns {string} 时辰地支
 */
const getShiChen = (hour) => {
  const shiChens = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const index = Math.floor(((hour + 1) % 24) / 2);
  return shiChens[index];
};

module.exports = {
  solarToLunar,
  lunarToSolar,
  getShiChen
};

