/**
 * 大运计算工具
 * 在前端本地计算大运排盘
 */

import { Solar } from 'lunar-javascript';

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 计算大运排盘
 * @param {Object} dateTime - 出生日期时间 {year, month, day, hour, minute}
 * @param {string} gender - 性别 ('男' 或 '女')
 * @param {Object} monthPillar - 月柱 {gan, zhi}
 * @returns {Object} 大运数据 {dayunList, qiyunAge}
 */
export const calculateDayun = (dateTime, gender, monthPillar) => {
  try {
    const { year, month, day, hour = 0, minute = 0 } = dateTime;

    // 使用 lunar-javascript 库
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();
    const bazi = lunar.getEightChar();

    // 获取起运信息
    const yunArray = bazi.getYun(gender === '男' ? 1: 0);
    // 起运年龄
    const qiyunAge = {
      years: yunArray.getStartYear(),
      months: yunArray.getStartMonth(),
      days: yunArray.getStartDay()
    };
    // 大运列表
    const dayunList = [];
    const daYuns = yunArray.getDaYun();
    for (let i = 0; i < Math.min(8, daYuns.length); i++) {
      const yun = daYuns[i];
      if (yun) {
        const ganZhi = yun.getGanZhi();
        const age = yun.getStartAge();
        const startYear = yun.getStartYear();

        dayunList.push({
          age: age,
          gan: ganZhi[0] || '',
          zhi: ganZhi[1] || '',
          startYear: startYear
        });
      }
    }

    return {
      dayunList,
      qiyunAge
    };

  } catch (error) {
    console.error('大运计算错误:', error);
    return {
      dayunList: [],
      qiyunAge: { years: 0, months: 0, days: 0 }
    };
  }
};

/**
 * 手动计算大运（备用方案，当没有完整日期时使用）
 * @param {Object} monthPillar - 月柱 {gan, zhi}
 * @param {string} yearGan - 年干
 * @param {string} gender - 性别
 * @param {number} birthYear - 出生年份（用于计算起运年份）
 * @returns {Object} 大运数据
 */
export const calculateDayunManual = (monthPillar, yearGan, gender, birthYear) => {
  try {
    // 判断阳年阴年
    const yangGan = ['甲', '丙', '戊', '庚', '壬'];
    const isYangYear = yangGan.includes(yearGan);

    // 确定顺逆：男阳女阴顺排，男阴女阳逆排
    const isShun = (gender === '男' && isYangYear) || (gender === '女' && !isYangYear);

    // 月柱在干支中的索引
    const monthGanIndex = TIAN_GAN.indexOf(monthPillar.gan);
    const monthZhiIndex = DI_ZHI.indexOf(monthPillar.zhi);

    if (monthGanIndex === -1 || monthZhiIndex === -1) {
      throw new Error('无效的月柱');
    }

    // 生成8步大运
    const dayunList = [];
    const qiyunYears = 3; // 默认起运年龄（简化处理）

    for (let i = 0; i < 8; i++) {
      let ganIndex, zhiIndex;

      if (isShun) {
        // 顺排
        ganIndex = (monthGanIndex + i + 1) % 10;
        zhiIndex = (monthZhiIndex + i + 1) % 12;
      } else {
        // 逆排
        ganIndex = (monthGanIndex - i - 1 + 100) % 10;
        zhiIndex = (monthZhiIndex - i - 1 + 120) % 12;
      }

      const age = qiyunYears + i * 10;
      const startYear = birthYear + age;

      dayunList.push({
        age: age,
        gan: TIAN_GAN[ganIndex],
        zhi: DI_ZHI[zhiIndex],
        startYear: startYear
      });
    }

    return {
      dayunList,
      qiyunAge: {
        years: qiyunYears,
        months: 0,
        days: 0
      }
    };

  } catch (error) {
    console.error('手动计算大运错误:', error);
    return {
      dayunList: [],
      qiyunAge: { years: 0, months: 0, days: 0 }
    };
  }
};

