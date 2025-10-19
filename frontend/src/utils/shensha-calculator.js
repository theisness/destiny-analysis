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

    // 天德贵人（按月支查）
    const tiandeMap = {
      '子': '巳', '丑': '庚', '寅': '丙', '卯': '壬',
      '辰': '辛', '巳': '亥', '午': '甲', '未': '癸',
      '申': '寅', '酉': '丁', '戌': '乙', '亥': '艮' // 艮作占位，忽略
    };
    const tiandeVal = tiandeMap[monthZhi];
    if (tiandeVal && tiandeVal !== '艮') {
      // 简化：若天德对应的天干或地支出现于四柱或时支
      if ([yearZhi, monthZhi, dayZhi, hourZhi].includes(tiandeVal) || dayGan === tiandeVal) {
        shensha.push('天德贵人');
      }
    }

    // 月德贵人（按月支查日干）
    const yuedeMap = {
      '寅': '丙', '午': '丙', '戌': '丙',
      '亥': '甲', '卯': '甲', '未': '甲',
      '巳': '壬', '酉': '壬', '丑': '壬',
      '申': '庚', '子': '庚', '辰': '庚'
    };
    if (yuedeMap[monthZhi] === dayGan) {
      shensha.push('月德贵人');
    }

    // 福星贵人（吉）
    const fuxingMap = {
      '甲': ['子', '午'], '乙': ['卯', '酉'],
      '丙': ['寅', '申'], '丁': ['卯', '酉'],
      '戊': ['辰', '戌'], '己': ['巳', '亥'],
      '庚': ['午', '子'], '辛': ['未', '丑'],
      '壬': ['申', '寅'], '癸': ['酉', '卯']
    };
    const fuxingZhi = fuxingMap[dayGan];
    if (fuxingZhi && (
      fuxingZhi.includes(yearZhi) || fuxingZhi.includes(monthZhi) ||
      fuxingZhi.includes(dayZhi) || (hourZhi && fuxingZhi.includes(hourZhi))
    )) {
      shensha.push('福星贵人');
    }

    // 禄神（按日干查“禄位”）
    const lushenMap = {
      '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午',
      '戊': '巳', '己': '午', '庚': '申', '辛': '酉',
      '壬': '亥', '癸': '子'
    };
    const lushenZhi = lushenMap[dayGan];
    if (lushenZhi && (
      lushenZhi === yearZhi || lushenZhi === monthZhi || lushenZhi === dayZhi || (hourZhi && lushenZhi === hourZhi)
    )) {
      shensha.push('禄神');
    }

    // 羊刃（按日干查“刃位”）
    const yangrenMap = {
      '甲': '卯', '乙': '辰', '丙': '午', '丁': '未',
      '戊': '午', '己': '未', '庚': '酉', '辛': '戌',
      '壬': '子', '癸': '丑'
    };
    const yangrenZhi = yangrenMap[dayGan];
    if (yangrenZhi && (
      yangrenZhi === yearZhi || yangrenZhi === monthZhi || yangrenZhi === dayZhi || (hourZhi && yangrenZhi === hourZhi)
    )) {
      shensha.push('羊刃');
    }

    // 驿马（年/日支查）
    const yimaMap = {
      '寅': '申', '午': '申', '戌': '申',
      '申': '寅', '子': '寅', '辰': '寅',
      '巳': '亥', '酉': '亥', '丑': '亥',
      '亥': '巳', '卯': '巳', '未': '巳'
    };
    for (const zhi of [yearZhi, dayZhi]) {
      const target = yimaMap[zhi];
      if (target && (target === yearZhi || target === monthZhi || target === dayZhi || (hourZhi && target === hourZhi))) {
        if (!shensha.includes('驿马')) shensha.push('驿马');
        break;
      }
    }

    // 华盖（年/日支查）
    const huagaiMap = {
      '寅': '戌', '午': '戌', '戌': '戌',
      '申': '辰', '子': '辰', '辰': '辰',
      '巳': '丑', '酉': '丑', '丑': '丑',
      '亥': '未', '卯': '未', '未': '未'
    };
    for (const zhi of [yearZhi, dayZhi]) {
      const target = huagaiMap[zhi];
      if (target && (target === yearZhi || target === monthZhi || target === dayZhi || (hourZhi && target === hourZhi))) {
        if (!shensha.includes('华盖')) shensha.push('华盖');
        break;
      }
    }

    // 将星（年/日支查）
    const jiangxingMap = {
      '寅': '子', '午': '子', '戌': '子',
      '申': '午', '子': '午', '辰': '午',
      '巳': '酉', '酉': '酉', '丑': '酉',
      '亥': '卯', '卯': '卯', '未': '卯'
    };
    for (const zhi of [yearZhi, dayZhi]) {
      const target = jiangxingMap[zhi];
      if (target && (target === yearZhi || target === monthZhi || target === dayZhi || (hourZhi && target === hourZhi))) {
        if (!shensha.includes('将星')) shensha.push('将星');
        break;
      }
    }

    // 红鸾、天喜（按年支查）
    const honglunMap = {
      '子': '卯', '丑': '寅', '寅': '丑', '卯': '子',
      '辰': '亥', '巳': '戌', '午': '酉', '未': '申',
      '申': '未', '酉': '午', '戌': '巳', '亥': '辰'
    };
    const tianxiMap = {
      '子': '酉', '丑': '申', '寅': '未', '卯': '午',
      '辰': '巳', '巳': '辰', '午': '卯', '未': '寅',
      '申': '丑', '酉': '子', '戌': '亥', '亥': '戌'
    };
    const honglunZhi = honglunMap[yearZhi];
    if (honglunZhi && (honglunZhi === monthZhi || honglunZhi === dayZhi || (hourZhi && honglunZhi === hourZhi))) {
      shensha.push('红鸾');
    }
    const tianxiZhi = tianxiMap[yearZhi];
    if (tianxiZhi && (tianxiZhi === monthZhi || tianxiZhi === dayZhi || (hourZhi && tianxiZhi === hourZhi))) {
      shensha.push('天喜');
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
    const guchenZhi = guchenMap[yearZhi];
    if (guchenZhi && (guchenZhi === monthZhi || guchenZhi === dayZhi || (hourZhi && guchenZhi === hourZhi))) {
      shensha.push('孤辰');
    }
    const guasuZhi = guasuMap[yearZhi];
    if (guasuZhi && (guasuZhi === monthZhi || guasuZhi === dayZhi || (hourZhi && guasuZhi === hourZhi))) {
      shensha.push('寡宿');
    }

    // 其他神煞可以根据需要继续添加...

  } catch (error) {
    console.error('神煞计算错误:', error);
  }
  
  return shensha;
};

// 神煞分类映射（展示使用）
const SHENSHA_CATEGORY_MAP = {
  '贵人类（吉神）': ['天乙贵人', '太极贵人', '国印贵人', '天德贵人', '月德贵人', '天官贵人'],
  '福禄类（吉神）': ['福星贵人', '禄神', '天财', '天福贵人', '财神'],
  '文昌类（吉神）': ['文昌贵人', '学堂', '词馆', '天书', '魁星'],
  '武勇类（吉神）': ['将星', '威权', '飞廉', '伏兵', '三台'],
  '桃花类（吉凶皆有）': ['红鸾', '天喜', '桃花', '咸池', '沐浴'],
  '凶煞类（凶神）': ['羊刃', '亡神', '劫煞', '灾煞', '天罗地网'],
  '刑害冲破类（凶神）': ['岁破', '月破', '华盖', '孤辰', '寡宿', '天刑'],
  '天象类（吉凶参半）': ['驿马', '天狗', '白虎', '天哭', '天赦', '地劫', '金神']
};

/**
 * 计算并分类神煞
 * @returns {Object<string, Array<string>>} 分类后的神煞：{ 类别: [神煞…] }
 */
export const calculateShenshaCategorized = (dayGan, yearZhi, monthZhi, dayZhi, hourZhi = '') => {
  const list = calculateShensha(dayGan, yearZhi, monthZhi, dayZhi, hourZhi) || [];
  const categorized = {};
  // 初始化类别键
  Object.keys(SHENSHA_CATEGORY_MAP).forEach(cat => { categorized[cat] = []; });
  // 归类
  for (const sha of list) {
    let placed = false;
    for (const [cat, items] of Object.entries(SHENSHA_CATEGORY_MAP)) {
      if (items.includes(sha)) {
        if (!categorized[cat].includes(sha)) categorized[cat].push(sha);
        placed = true;
        break;
      }
    }
    if (!placed) {
      // 归入“天象类”或建立“其他”分组
      if (!categorized['天象类（吉凶参半）'].includes(sha)) categorized['天象类（吉凶参半）'].push(sha);
    }
  }
  return categorized;
};