/**
 * 流年流月计算工具函数
 */

// 天干地支常量
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 计算流年（前后各5年）
export const calculateLiunian = (centerYear, currentYear) => {
  const liunian = [];
  const startYear = centerYear - 5;

  for (let i = 0; i < 11; i++) {
    const year = startYear + i;
    const ganIndex = (year - 4) % 10;
    const zhiIndex = (year - 4) % 12;

    liunian.push({
      year: year,
      gan: TIAN_GAN[ganIndex],
      zhi: DI_ZHI[zhiIndex],
      isCurrent: year === currentYear
    });
  }

  return liunian;
};

// 计算流月（五虎遁月诀）
/**
 * 计算流月（五虎遁月诀）
 * @param {number} year - 目标年份
 * @param {object} currentLunar - 当前农历日期对象，包含year, month, day, hour, minute, second
 * @returns {object[]} 流月数据数组，每个元素包含month, gan, zhi, isCurrent
 */
export const calculateLiuyue = (year, currentLunar) => {
  const liuyue = [];
  const yearGanIndex = (year - 4) % 10;

  // 五虎遁月诀：甲己之年丙作首，乙庚之岁戊为头，丙辛必定寻庚起，丁壬壬位顺行流，戊癸甲寅好追求
  const firstMonthGanMap = {
    0: 2, 5: 2,  // 甲、己年从丙起
    1: 4, 6: 4,  // 乙、庚年从戊起
    2: 6, 7: 6,  // 丙、辛年从庚起
    3: 8, 8: 8,  // 丁、壬年从壬起
    4: 0, 9: 0   // 戊、癸年从甲起
  };

  let monthGanIndex = firstMonthGanMap[yearGanIndex];

  // 获取当前农历月份
  let currentLunarMonth = null;
  let currentLunarYear = null;

  if (currentLunar) {
    currentLunarMonth = Math.abs(currentLunar.getMonth()); // 农历月可能是负数（闰月）
    currentLunarYear = currentLunar.getYear();
  }

  for (let month = 1; month <= 12; month++) {
    const isCurrentMonth = monthGanIndex%10 === currentLunar.getMonthGanIndex() &&
                          year === currentLunarYear;
    liuyue.push({
      month: month,
      gan: TIAN_GAN[monthGanIndex % 10],
      zhi: DI_ZHI[(month + 1) % 12],
      isCurrent: isCurrentMonth
    });
    monthGanIndex++;
  }

  return liuyue;
};

// 格式化日期
export const formatDate = (dateObj) => {
  if (!dateObj || !dateObj.year) return '未知';
  return `${dateObj.year}年${dateObj.month}月${dateObj.day}日 ${dateObj.hour || 0}时${dateObj.minute || 0}分`;
};