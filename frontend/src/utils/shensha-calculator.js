/**
 * 神煞计算工具函数
 */

/**
 * 计算神煞
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
      '甲': '巳', '乙': '午', '丙': '申',
      '丁': '酉', '戊': '申', '己': '酉',
      '庚': '亥', '辛': '子', '壬': '寅',
      '癸': '卯'
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
    
    // 金神
    const jinshenMap = {
      '子': '申', '丑': '酉', '寅': '戌',
      '卯': '亥', '辰': '子', '巳': '丑',
      '午': '寅', '未': '卯', '申': '辰',
      '酉': '巳', '戌': '午', '亥': '未'
    };
    
    if (jinshenMap[monthZhi] === yearZhi || 
        jinshenMap[monthZhi] === dayZhi ||
        (hourZhi && jinshenMap[monthZhi] === hourZhi)) {
      shensha.push('金神');
    }
    
    // 其他神煞可以根据需要继续添加...
    
  } catch (error) {
    console.error('神煞计算错误:', error);
  }
  
  return shensha;
};