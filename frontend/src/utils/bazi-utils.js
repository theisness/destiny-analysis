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

/**
 * 计算神煞（本地计算）
 * @param {string} dayGan - 日干
 * @param {string} yearZhi - 年支
 * @param {string} monthZhi - 月支
 * @param {string} dayZhi - 日支
 * @param {string} hourZhi - 时支（可选）
 * @returns {Array<string>} 神煞列表
 */
export const calculateShensha = (dayGan, yearZhi, monthZhi, dayZhi, hourZhi = '') => {
  const shensha = [];
  
  try {
    // 天乙贵人
    const tianyiMap = {
      '甲': ['丑', '未'], '戊': ['丑', '未'],
      '乙': ['子', '申'], '己': ['子', '申'],
      '丙': ['亥', '酉'], '丁': ['亥', '酉'],
      '庚': ['丑', '未'], '辛': ['寅', '午'],
      '壬': ['卯', '巳'], '癸': ['卯', '巳']
    };
    
    if (tianyiMap[dayGan]) {
      const tianyiZhi = tianyiMap[dayGan];
      if (tianyiZhi.includes(yearZhi) || 
          tianyiZhi.includes(monthZhi) || 
          tianyiZhi.includes(dayZhi) ||
          (hourZhi && tianyiZhi.includes(hourZhi))) {
        shensha.push('天乙贵人');
      }
    }
    
    // 桃花（咸池）
    // 年支或日支见：寅午戌见卯，申子辰见酉，巳酉丑见午，亥卯未见子
    const taohuaMap = {
      '寅': '卯', '午': '卯', '戌': '卯',
      '申': '酉', '子': '酉', '辰': '酉',
      '巳': '午', '酉': '午', '丑': '午',
      '亥': '子', '卯': '子', '未': '子'
    };
    
    const taohuaCheck = [yearZhi, dayZhi];
    for (const zhi of taohuaCheck) {
      if (taohuaMap[zhi]) {
        if (taohuaMap[zhi] === yearZhi || 
            taohuaMap[zhi] === monthZhi || 
            taohuaMap[zhi] === dayZhi ||
            (hourZhi && taohuaMap[zhi] === hourZhi)) {
          if (!shensha.includes('桃花')) {
            shensha.push('桃花');
          }
          break;
        }
      }
    }
    
    // 文昌贵人
    const wenchangMap = {
      '甲': '巳', '乙': '午', '丙': '申', '丁': '酉',
      '戊': '申', '己': '酉', '庚': '亥', '辛': '子',
      '壬': '寅', '癸': '卯'
    };
    
    if (wenchangMap[dayGan]) {
      const wenchangZhi = wenchangMap[dayGan];
      if (wenchangZhi === yearZhi || 
          wenchangZhi === monthZhi || 
          wenchangZhi === dayZhi ||
          (hourZhi && wenchangZhi === hourZhi)) {
        shensha.push('文昌贵人');
      }
    }
    
    // 天德贵人（按月支查）
    const tiandeMap = {
      '子': '巳', '丑': '庚', '寅': '丙', '卯': '壬',
      '辰': '辛', '巳': '亥', '午': '甲', '未': '癸',
      '申': '寅', '酉': '丁', '戌': '乙', '亥': '艮'
    };
    
    if (tiandeMap[monthZhi] && tiandeMap[monthZhi] !== '艮') {
      const tiandeValue = tiandeMap[monthZhi];
      // 天德可能是天干或地支
      if ([yearZhi, dayZhi, hourZhi].includes(tiandeValue) ||
          [dayGan].includes(tiandeValue)) {
        shensha.push('天德贵人');
      }
    }
    
    // 月德贵人（按月支查日干）
    const yuedeMap = {
      '寅': '丙', '午': '丙', '戌': '丙',  // 寅午戌月丙日
      '亥': '甲', '卯': '甲', '未': '甲',  // 亥卯未月甲日
      '巳': '壬', '酉': '壬', '丑': '壬',  // 巳酉丑月壬日
      '申': '庚', '子': '庚', '辰': '庚'   // 申子辰月庚日
    };
    
    if (yuedeMap[monthZhi] === dayGan) {
      shensha.push('月德贵人');
    }
    
    // 天乙贵人（福星贵人）
    const fuxingMap = {
      '甲': ['子', '午'], '乙': ['卯', '酉'],
      '丙': ['寅', '申'], '丁': ['卯', '酉'],
      '戊': ['辰', '戌'], '己': ['巳', '亥'],
      '庚': ['午', '子'], '辛': ['未', '丑'],
      '壬': ['申', '寅'], '癸': ['酉', '卯']
    };
    
    if (fuxingMap[dayGan]) {
      const fuxingZhi = fuxingMap[dayGan];
      if (fuxingZhi.includes(yearZhi) || 
          fuxingZhi.includes(monthZhi) || 
          fuxingZhi.includes(dayZhi) ||
          (hourZhi && fuxingZhi.includes(hourZhi))) {
        if (!shensha.includes('福星贵人')) {
          shensha.push('福星贵人');
        }
      }
    }
    
    // 驿马（按年支或日支查）
    const yimaMap = {
      '寅': '申', '午': '申', '戌': '申',
      '申': '寅', '子': '寅', '辰': '寅',
      '巳': '亥', '酉': '亥', '丑': '亥',
      '亥': '巳', '卯': '巳', '未': '巳'
    };
    
    const yimaCheck = [yearZhi, dayZhi];
    for (const zhi of yimaCheck) {
      if (yimaMap[zhi]) {
        if (yimaMap[zhi] === yearZhi || 
            yimaMap[zhi] === monthZhi || 
            yimaMap[zhi] === dayZhi ||
            (hourZhi && yimaMap[zhi] === hourZhi)) {
          if (!shensha.includes('驿马')) {
            shensha.push('驿马');
          }
          break;
        }
      }
    }
    
    // 华盖（按年支或日支查）
    const huagaiMap = {
      '寅': '戌', '午': '戌', '戌': '戌',
      '申': '辰', '子': '辰', '辰': '辰',
      '巳': '丑', '酉': '丑', '丑': '丑',
      '亥': '未', '卯': '未', '未': '未'
    };
    
    const huagaiCheck = [yearZhi, dayZhi];
    for (const zhi of huagaiCheck) {
      if (huagaiMap[zhi]) {
        if (huagaiMap[zhi] === yearZhi || 
            huagaiMap[zhi] === monthZhi || 
            huagaiMap[zhi] === dayZhi ||
            (hourZhi && huagaiMap[zhi] === hourZhi)) {
          if (!shensha.includes('华盖')) {
            shensha.push('华盖');
          }
          break;
        }
      }
    }
    
    // 将星（按年支或日支查）
    const jiangxingMap = {
      '寅': '子', '午': '子', '戌': '子',
      '申': '午', '子': '午', '辰': '午',
      '巳': '酉', '酉': '酉', '丑': '酉',
      '亥': '卯', '卯': '卯', '未': '卯'
    };
    
    const jiangxingCheck = [yearZhi, dayZhi];
    for (const zhi of jiangxingCheck) {
      if (jiangxingMap[zhi]) {
        if (jiangxingMap[zhi] === yearZhi || 
            jiangxingMap[zhi] === monthZhi || 
            jiangxingMap[zhi] === dayZhi ||
            (hourZhi && jiangxingMap[zhi] === hourZhi)) {
          if (!shensha.includes('将星')) {
            shensha.push('将星');
          }
          break;
        }
      }
    }
    
    // 金舆（按日干查）
    const jinyuMap = {
      '甲': '辰', '乙': '巳', '丙': '未', '丁': '申',
      '戊': '辰', '己': '巳', '庚': '戌', '辛': '亥',
      '壬': '丑', '癸': '寅'
    };
    
    if (jinyuMap[dayGan]) {
      const jinyuZhi = jinyuMap[dayGan];
      if (jinyuZhi === yearZhi || 
          jinyuZhi === monthZhi || 
          jinyuZhi === dayZhi ||
          (hourZhi && jinyuZhi === hourZhi)) {
        shensha.push('金舆');
      }
    }
    
    // 红鸾（按年支查）
    const honglunMap = {
      '子': '卯', '丑': '寅', '寅': '丑', '卯': '子',
      '辰': '亥', '巳': '戌', '午': '酉', '未': '申',
      '申': '未', '酉': '午', '戌': '巳', '亥': '辰'
    };
    
    if (honglunMap[yearZhi]) {
      const honglunZhi = honglunMap[yearZhi];
      if (honglunZhi === monthZhi || 
          honglunZhi === dayZhi ||
          (hourZhi && honglunZhi === hourZhi)) {
        shensha.push('红鸾');
      }
    }
    
    // 天喜（按年支查，红鸾对冲）
    const tianxiMap = {
      '子': '酉', '丑': '申', '寅': '未', '卯': '午',
      '辰': '巳', '巳': '辰', '午': '卯', '未': '寅',
      '申': '丑', '酉': '子', '戌': '亥', '亥': '戌'
    };
    
    if (tianxiMap[yearZhi]) {
      const tianxiZhi = tianxiMap[yearZhi];
      if (tianxiZhi === monthZhi || 
          tianxiZhi === dayZhi ||
          (hourZhi && tianxiZhi === hourZhi)) {
        shensha.push('天喜');
      }
    }
    
    // 孤辰寡宿（按年支查）
    const guchenMap = {
      '寅': '巳', '午': '巳', '戌': '巳',
      '申': '亥', '子': '亥', '辰': '亥',
      '巳': '寅', '酉': '寅', '丑': '寅',
      '亥': '申', '卯': '申', '未': '申'
    };
    
    const guasuMap = {
      '寅': '丑', '午': '丑', '戌': '丑',
      '申': '未', '子': '未', '辰': '未',
      '巳': '辰', '酉': '辰', '丑': '辰',
      '亥': '戌', '卯': '戌', '未': '戌'
    };
    
    if (guchenMap[yearZhi]) {
      const guchenZhi = guchenMap[yearZhi];
      if (guchenZhi === monthZhi || 
          guchenZhi === dayZhi ||
          (hourZhi && guchenZhi === hourZhi)) {
        shensha.push('孤辰');
      }
    }
    
    if (guasuMap[yearZhi]) {
      const guasuZhi = guasuMap[yearZhi];
      if (guasuZhi === monthZhi || 
          guasuZhi === dayZhi ||
          (hourZhi && guasuZhi === hourZhi)) {
        shensha.push('寡宿');
      }
    }
    
  } catch (error) {
    console.error('计算神煞错误:', error);
  }
  
  return shensha;
};

export const getZhiCangGan = (zhi) => {
  try {
    const cangGan = ZHI_CANG_GAN[zhi];
    return cangGan ? [...cangGan] : [];
  } catch (error) {
    console.error('获取地支藏干错误:', error);
    return [];
  }
};

