/**
 * 八字五行计算工具
 * 用于计算八字中的五行强弱比例
 */

// 天干五行对照表
const GAN_WUXING = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 地支五行对照表
const ZHI_WUXING = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水',
  '辰': '土', '戌': '土', '丑': '土', '未': '土'
};

// 地支藏干对照表
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

/**
 * 计算地支藏干
 * @param {Object} baziResult - 八字结果对象，包含四柱天干地支
 * @returns {Object} 藏干对象，按四柱分类
 */
export const calculateHiddenGan = (baziResult) => {
  const hiddenGan = {};
  
  if (!baziResult) return hiddenGan;
  
  const pillars = ['year', 'month', 'day', 'hour'];
  pillars.forEach(pillar => {
    const pillarData = baziResult[`${pillar}Pillar`];
    if (pillarData && pillarData.zhi) {
      hiddenGan[pillar] = ZHI_CANG_GAN[pillarData.zhi] || [];
    }
  });
  
  return hiddenGan;
};

/**
 * 计算五行强弱
 * @param {Object} baziResult - 八字结果对象，包含四柱天干地支
 * @param {Object} hiddenGan - 藏干对象，如果未提供则会自动计算
 * @returns {Object} 五行强弱对象
 */
export const calculateWuxing = (baziResult, hiddenGan = null) => {
  if (!baziResult) return { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0 };
  
  const { yearPillar, monthPillar, dayPillar, hourPillar } = baziResult;
  const wuxing = { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0 };
  
  // 如果未提供藏干，则计算藏干
  if (!hiddenGan) {
    hiddenGan = calculateHiddenGan(baziResult);
  }
  
  // 四柱权重配置
  const pillarWeights = {
    year: { gan: 0.075, zhi: 0.075, hiddenMultiplier: 1.0 },
    month: { gan: 0.10, zhi: 0.30, hiddenMultiplier: 1.5 },
    day: { gan: 0.15, zhi: 0.15, hiddenMultiplier: 1.0 },
    hour: { gan: 0.075, zhi: 0.075, hiddenMultiplier: 1.0 }
  };
  
  // 天干五行（按照不同柱位权重）
  const ganWuxingAdd = (pillar, gan) => {
    const wx = GAN_WUXING[gan];
    const weight = pillarWeights[pillar].gan;
    if (wx === '金') wuxing.jin += weight;
    else if (wx === '木') wuxing.mu += weight;
    else if (wx === '水') wuxing.shui += weight;
    else if (wx === '火') wuxing.huo += weight;
    else if (wx === '土') wuxing.tu += weight;
  };
  
  ganWuxingAdd('year', yearPillar.gan);
  ganWuxingAdd('month', monthPillar.gan);
  ganWuxingAdd('day', dayPillar.gan);
  ganWuxingAdd('hour', hourPillar.gan);
  
  // 藏干五行（按照本气、中气、余气比例计算，并根据柱位调整权重）
  const pillars = ['year', 'month', 'day', 'hour'];
  pillars.forEach(pillar => {
    const gans = hiddenGan[pillar] || [];
    
    // 根据藏干数量确定权重
    let weights = [];
    if (gans.length === 1) {
      // 藏一干：本气100%
      weights = [1.0];
    } else if (gans.length === 2) {
      // 藏二干：本气70%、中气30%
      weights = [0.7, 0.3];
    } else if (gans.length === 3) {
      // 藏三干：本气60%、中气30%、余气10%
      weights = [0.6, 0.3, 0.1];
    }
    
    // 应用权重计算五行
    gans.forEach((gan, index) => {
      if (index < weights.length) {
        const wx = GAN_WUXING[gan];
        // 根据柱位调整权重
        const weight = weights[index] * pillarWeights[pillar].zhi;
        if (wx === '金') wuxing.jin += weight;
        else if (wx === '木') wuxing.mu += weight;
        else if (wx === '水') wuxing.shui += weight;
        else if (wx === '火') wuxing.huo += weight;
        else if (wx === '土') wuxing.tu += weight;
      }
    });
  });

  return wuxing;
};

/**
 * 获取地支本气
 * @param {string} zhi - 地支
 * @returns {string} 本气天干
 */
export const getZhiBenQi = (zhi) => {
  const cangGan = ZHI_CANG_GAN[zhi];
  return cangGan && cangGan.length > 0 ? cangGan[0] : '';
};

/**
 * 获取五行颜色
 * @param {string} element - 五行元素
 * @returns {string} 颜色代码
 */
export const getWuxingColor = (element) => {
  const colorMap = {
    '金': '#B8860B',
    '木': '#228B22',
    '水': '#1E90FF',
    '火': '#FF4500',
    '土': '#8B4513'
  };
  return colorMap[element] || '#333';
};

/**
 * 获取天干五行
 * @param {string} gan - 天干
 * @returns {string} 五行
 */
export const getGanWuxing = (gan) => {
  return GAN_WUXING[gan] || '';
};

/**
 * 获取地支五行
 * @param {string} zhi - 地支
 * @returns {string} 五行
 */
export const getZhiWuxing = (zhi) => {
  return ZHI_WUXING[zhi] || '';
};

/**
 * 获取纳音颜色
 * @param {string} nayin - 纳音
 * @returns {string} 颜色代码
 */
export const getNaYinColor = (nayin) => {
  // 根据纳音五行分类
  if (nayin.includes('金')) return '#B8860B';  // 金色（调暗）
  if (nayin.includes('木')) return '#228B22';  // 绿色
  if (nayin.includes('水')) return '#1E90FF';  // 蓝色
  if (nayin.includes('火')) return '#FF4500';  // 红色
  if (nayin.includes('土')) return '#8B4513';  // 褐色
  return '#666';
};