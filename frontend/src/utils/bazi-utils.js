/**
 * 八字辅助计算工具
 * 计算地势（十二长生）和纳音五行
 */

import { Solar } from 'lunar-javascript';

/**
 * 十二长生表
 * 五行对应的十二长生位置（以地支为索引）
 */
const CHANG_SHENG_MAP = {
  // 水长生在申
  '水': ['绝', '胎', '养', '长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓'],
  // 木长生在亥
  '木': ['沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养', '长生'],
  // 火土长生在寅
  '火': ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'],
  '土': ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'],
  // 金长生在巳
  '金': ['胎', '养', '长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝']
};

// 地支顺序
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干五行
const GAN_WUXING = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 地支藏干表（本气在前）
const ZHI_CANG_GAN = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲']
};

// 纳音五行表（60甲子纳音）
const NAYIN_MAP = {
  '甲子': '海中金', '乙丑': '海中金',
  '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木',
  '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金',
  '甲戌': '山头火', '乙亥': '山头火',
  
  '丙子': '涧下水', '丁丑': '涧下水',
  '戊寅': '城墙土', '己卯': '城墙土',
  '庚辰': '白蜡金', '辛巳': '白蜡金',
  '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水',
  '丙戌': '屋上土', '丁亥': '屋上土',
  
  '戊子': '霹雳火', '己丑': '霹雳火',
  '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水',
  '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火',
  '戊戌': '平地木', '己亥': '平地木',
  
  '庚子': '壁上土', '辛丑': '壁上土',
  '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '佛灯火', '乙巳': '佛灯火',
  '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土',
  '庚戌': '钗钏金', '辛亥': '钗钏金',
  
  '壬子': '桑柘木', '癸丑': '桑柘木',
  '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土',
  '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木',
  '壬戌': '大海水', '癸亥': '大海水'
};

/**
 * 计算十二长生（地势）
 * @param {string} gan - 天干
 * @param {string} zhi - 地支
 * @returns {string} 地势（长生、沐浴、冠带等）
 */
export const calculateDiShi = (gan, zhi) => {
  try {
    const wuxing = GAN_WUXING[gan];
    if (!wuxing) return '';
    
    const zhiIndex = DI_ZHI.indexOf(zhi);
    if (zhiIndex === -1) return '';
    
    const changShengList = CHANG_SHENG_MAP[wuxing];
    return changShengList[zhiIndex] || '';
  } catch (error) {
    console.error('计算地势错误:', error);
    return '';
  }
};

/**
 * 计算纳音五行
 * @param {string} gan - 天干
 * @param {string} zhi - 地支
 * @returns {string} 纳音（如：海中金、炉中火等）
 */
export const calculateNaYin = (gan, zhi) => {
  try {
    const ganZhi = gan + zhi;
    return NAYIN_MAP[ganZhi] || '';
  } catch (error) {
    console.error('计算纳音错误:', error);
    return '';
  }
};

/**
 * 使用lunar-javascript库计算纳音（备用方案）
 * @param {Object} dateTime - 出生日期时间
 * @returns {Object} 包含四柱纳音的对象
 */
export const calculateNaYinByDate = (dateTime) => {
  try {
    const { year, month, day, hour = 0, minute = 0 } = dateTime;
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();
    
    return {
      year: lunar.getYearNaYin(),
      month: lunar.getMonthNaYin(),
      day: lunar.getDayNaYin(),
      hour: lunar.getTimeNaYin()
    };
  } catch (error) {
    console.error('使用lunar库计算纳音错误:', error);
    return {
      year: '',
      month: '',
      day: '',
      hour: ''
    };
  }
};

/**
 * 使用lunar-javascript库计算十二长生（备用方案）
 * @param {Object} dateTime - 出生日期时间
 * @returns {Object} 包含四柱地势的对象
 */
export const calculateDiShiByDate = (dateTime) => {
  try {
    const { year, month, day, hour = 0, minute = 0 } = dateTime;
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();
    const bazi = lunar.getEightChar();
    
    // 获取四柱
    const yearGanZhi = lunar.getYearInGanZhi();
    const monthGanZhi = lunar.getMonthInGanZhi();
    const dayGanZhi = lunar.getDayInGanZhi();
    const timeGanZhi = lunar.getTimeInGanZhi();
    
    return {
      year: calculateDiShi(yearGanZhi[0], yearGanZhi[1]),
      month: calculateDiShi(monthGanZhi[0], monthGanZhi[1]),
      day: calculateDiShi(dayGanZhi[0], dayGanZhi[1]),
      hour: calculateDiShi(timeGanZhi[0], timeGanZhi[1])
    };
  } catch (error) {
    console.error('使用lunar库计算地势错误:', error);
    return {
      year: '',
      month: '',
      day: '',
      hour: ''
    };
  }
};

/**
 * 获取地势对应的颜色
 * @param {string} dishi - 地势名称
 * @returns {string} 颜色代码
 */
export const getDiShiColor = (dishi) => {
  const colorMap = {
    '长生': '#228B22',  // 绿色 - 生机盎然
    '沐浴': '#87CEEB',  // 天蓝 - 洗涤新生
    '冠带': '#4169E1',  // 皇家蓝 - 成长
    '临官': '#1E90FF',  // 道奇蓝 - 建功立业
    '帝旺': '#FF4500',  // 橙红 - 鼎盛时期
    '衰': '#FFA500',    // 橙色 - 开始衰落
    '病': '#FFD700',    // 金色 - 病弱
    '死': '#808080',    // 灰色 - 死亡
    '墓': '#696969',    // 暗灰 - 入墓
    '绝': '#2F4F4F',    // 深灰 - 断绝
    '胎': '#9370DB',    // 紫色 - 孕育
    '养': '#8FBC8F'     // 海绿 - 养育
  };
  return colorMap[dishi] || '#666';
};

/**
 * 获取纳音对应的颜色
 * @param {string} nayin - 纳音名称
 * @returns {string} 颜色代码
 */
export const getNaYinColor = (nayin) => {
  // 根据纳音五行分类
  if (nayin.includes('金')) return '#FFD700';  // 金色
  if (nayin.includes('木')) return '#228B22';  // 绿色
  if (nayin.includes('水')) return '#1E90FF';  // 蓝色
  if (nayin.includes('火')) return '#FF4500';  // 红色
  if (nayin.includes('土')) return '#8B4513';  // 褐色
  return '#666';
};

/**
 * 获取地支藏干的本气（主气）
 * @param {string} zhi - 地支
 * @returns {string} 本气天干
 */
export const getZhiBenQi = (zhi) => {
  try {
    const cangGan = ZHI_CANG_GAN[zhi];
    return cangGan ? cangGan[0] : '';
  } catch (error) {
    console.error('获取地支本气错误:', error);
    return '';
  }
};

