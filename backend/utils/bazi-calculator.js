const { Solar, Lunar } = require('lunar-javascript');

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

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

// 神煞表（简化版）
const SHEN_SHA = {
  tianyi: '天乙贵人',
  taiji: '太极贵人',
  tiande: '天德贵人',
  yuede: '月德贵人',
  wenchang: '文昌贵人',
  jiangxing: '将星',
  taohua: '桃花',
  hongluan: '红鸾',
  tianxi: '天喜',
  guchen: '孤辰',
  guasu: '寡宿'
};

/**
 * 根据公历日期时间计算八字
 * @param {Object} dateTime - 包含year, month, day, hour, minute的对象
 * @param {string} gender - 性别 ('男' 或 '女')
 * @returns {Object} 八字排盘结果
 */
const calculateBazi = (dateTime, gender) => {
  const { year, month, day, hour, minute } = dateTime;
  
  try {
    // 使用 lunar-javascript 库计算四柱
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();
    const bazi = lunar.getEightChar();
    
    // 获取四柱
    const yearGanZhi = bazi.getYearInGanZhi();
    const monthGanZhi = bazi.getMonthInGanZhi();
    const dayGanZhi = bazi.getDayInGanZhi();
    const timeGanZhi = bazi.getTimeInGanZhi();
    
    // 提取天干地支
    const yearPillar = { gan: yearGanZhi[0], zhi: yearGanZhi[1] };
    const monthPillar = { gan: monthGanZhi[0], zhi: monthGanZhi[1] };
    const dayPillar = { gan: dayGanZhi[0], zhi: dayGanZhi[1] };
    const hourPillar = { gan: timeGanZhi[0], zhi: timeGanZhi[1] };
    
    // 计算藏干
    const hiddenGan = {
      year: ZHI_CANG_GAN[yearPillar.zhi] || [],
      month: ZHI_CANG_GAN[monthPillar.zhi] || [],
      day: ZHI_CANG_GAN[dayPillar.zhi] || [],
      hour: ZHI_CANG_GAN[hourPillar.zhi] || []
    };
    
    // 计算五行强弱
    const wuxing = calculateWuxing(yearPillar, monthPillar, dayPillar, hourPillar, hiddenGan);
    
    // 计算大运
    const dayun = calculateDayun(bazi, gender);
    
    // 计算起运时间
    const qiyunAge = calculateQiyunAge(bazi, gender);
    
    // 计算神煞
    const shensha = calculateShensha(dayPillar.gan, yearPillar.zhi, monthPillar.zhi, dayPillar.zhi);
    
    // 计算流年（最近10年）
    const liunian = calculateLiunian(year);
    
    // 计算流月
    const liuyue = calculateLiuyue(year);
    
    return {
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
      hiddenGan,
      wuxing,
      dayun,
      qiyunAge,
      shensha,
      liunian,
      liuyue
    };
  } catch (error) {
    throw new Error(`八字计算失败: ${error.message}`);
  }
};

/**
 * 计算五行强弱
 */
const calculateWuxing = (yearPillar, monthPillar, dayPillar, hourPillar, hiddenGan) => {
  const wuxing = { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0 };
  
  // 天干五行
  [yearPillar.gan, monthPillar.gan, dayPillar.gan, hourPillar.gan].forEach(gan => {
    const wx = GAN_WUXING[gan];
    if (wx === '金') wuxing.jin += 1.2;
    else if (wx === '木') wuxing.mu += 1.2;
    else if (wx === '水') wuxing.shui += 1.2;
    else if (wx === '火') wuxing.huo += 1.2;
    else if (wx === '土') wuxing.tu += 1.2;
  });
  
  // 地支五行
  [yearPillar.zhi, monthPillar.zhi, dayPillar.zhi, hourPillar.zhi].forEach(zhi => {
    const wx = ZHI_WUXING[zhi];
    if (wx === '金') wuxing.jin += 1;
    else if (wx === '木') wuxing.mu += 1;
    else if (wx === '水') wuxing.shui += 1;
    else if (wx === '火') wuxing.huo += 1;
    else if (wx === '土') wuxing.tu += 1;
  });
  
  // 藏干五行（权重较小）
  Object.values(hiddenGan).forEach(gans => {
    gans.forEach(gan => {
      const wx = GAN_WUXING[gan];
      if (wx === '金') wuxing.jin += 0.3;
      else if (wx === '木') wuxing.mu += 0.3;
      else if (wx === '水') wuxing.shui += 0.3;
      else if (wx === '火') wuxing.huo += 0.3;
      else if (wx === '土') wuxing.tu += 0.3;
    });
  });
  
  // 保留一位小数
  Object.keys(wuxing).forEach(key => {
    wuxing[key] = Math.round(wuxing[key] * 10) / 10;
  });
  
  return wuxing;
};

/**
 * 计算大运
 */
const calculateDayun = (bazi, gender) => {
  const dayun = [];
  const yunArray = bazi.getDaYun(gender === '女' ? 0 : 1);
  
  for (let i = 0; i < 8; i++) {
    const yun = yunArray.getDaYun()[i];
    if (yun) {
      const ganZhi = yun.getGanZhi();
      dayun.push({
        age: yun.getStartAge(),
        gan: ganZhi[0],
        zhi: ganZhi[1],
        startYear: yun.getStartYear()
      });
    }
  }
  
  return dayun;
};

/**
 * 计算起运时间
 */
const calculateQiyunAge = (bazi, gender) => {
  const yunArray = bazi.getDaYun(gender === '女' ? 0 : 1);
  const startAge = yunArray.getStartAge();
  const startMonth = yunArray.getStartMonth();
  const startDay = yunArray.getStartDay();
  
  return {
    years: startAge,
    months: startMonth,
    days: startDay
  };
};

/**
 * 计算神煞（简化版）
 */
const calculateShensha = (dayGan, yearZhi, monthZhi, dayZhi) => {
  const shensha = [];
  
  // 天乙贵人
  const tianyiMap = {
    '甲': ['丑', '未'], '戊': ['丑', '未'],
    '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'],
    '庚': ['丑', '未'], '辛': ['寅', '午'],
    '壬': ['卯', '巳'], '癸': ['卯', '巳']
  };
  
  if (tianyiMap[dayGan]) {
    if (tianyiMap[dayGan].includes(yearZhi) || 
        tianyiMap[dayGan].includes(monthZhi) || 
        tianyiMap[dayGan].includes(dayZhi)) {
      shensha.push('天乙贵人');
    }
  }
  
  // 桃花
  const taohuaMap = {
    '寅': '卯', '午': '卯', '戌': '卯',
    '申': '酉', '子': '酉', '辰': '酉',
    '巳': '午', '酉': '午', '丑': '午',
    '亥': '子', '卯': '子', '未': '子'
  };
  
  if (taohuaMap[yearZhi] === dayZhi || 
      taohuaMap[monthZhi] === dayZhi || 
      taohuaMap[dayZhi] === dayZhi) {
    shensha.push('桃花');
  }
  
  // 文昌贵人
  const wenchangMap = {
    '甲': '巳', '乙': '午', '丙': '申', '丁': '酉',
    '戊': '申', '己': '酉', '庚': '亥', '辛': '子',
    '壬': '寅', '癸': '卯'
  };
  
  if (wenchangMap[dayGan] === yearZhi || 
      wenchangMap[dayGan] === monthZhi || 
      wenchangMap[dayGan] === dayZhi) {
    shensha.push('文昌贵人');
  }
  
  return shensha;
};

/**
 * 计算流年（最近10年）
 */
const calculateLiunian = (currentYear) => {
  const liunian = [];
  const startYear = currentYear - 5;
  
  for (let i = 0; i < 10; i++) {
    const year = startYear + i;
    const ganIndex = (year - 4) % 10;
    const zhiIndex = (year - 4) % 12;
    
    liunian.push({
      year: year,
      gan: TIAN_GAN[ganIndex],
      zhi: DI_ZHI[zhiIndex]
    });
  }
  
  return liunian;
};

/**
 * 计算流月
 */
const calculateLiuyue = (currentYear) => {
  const liuyue = [];
  const yearGanIndex = (currentYear - 4) % 10;
  
  // 计算该年正月的天干
  // 五虎遁月诀：甲己之年丙作首，乙庚之岁戊为头，丙辛必定寻庚起，丁壬壬位顺行流，戊癸甲寅好追求
  const firstMonthGanMap = {
    0: 2, 5: 2,  // 甲、己年从丙起
    1: 4, 6: 4,  // 乙、庚年从戊起
    2: 6, 7: 6,  // 丙、辛年从庚起
    3: 8, 8: 8,  // 丁、壬年从壬起
    4: 0, 9: 0   // 戊、癸年从甲起
  };
  
  let monthGanIndex = firstMonthGanMap[yearGanIndex];
  
  for (let month = 1; month <= 12; month++) {
    liuyue.push({
      month: month,
      gan: TIAN_GAN[monthGanIndex % 10],
      zhi: DI_ZHI[(month + 1) % 12]
    });
    monthGanIndex++;
  }
  
  return liuyue;
};

/**
 * 从四柱直接计算八字（当用户直接输入四柱时）
 */
const calculateFromSizhu = (yearGanZhi, monthGanZhi, dayGanZhi, hourGanZhi, gender) => {
  const yearPillar = { gan: yearGanZhi[0], zhi: yearGanZhi[1] };
  const monthPillar = { gan: monthGanZhi[0], zhi: monthGanZhi[1] };
  const dayPillar = { gan: dayGanZhi[0], zhi: dayGanZhi[1] };
  const hourPillar = { gan: hourGanZhi[0], zhi: hourGanZhi[1] };
  
  // 计算藏干
  const hiddenGan = {
    year: ZHI_CANG_GAN[yearPillar.zhi] || [],
    month: ZHI_CANG_GAN[monthPillar.zhi] || [],
    day: ZHI_CANG_GAN[dayPillar.zhi] || [],
    hour: ZHI_CANG_GAN[hourPillar.zhi] || []
  };
  
  // 计算五行强弱
  const wuxing = calculateWuxing(yearPillar, monthPillar, dayPillar, hourPillar, hiddenGan);
  
  // 计算神煞
  const shensha = calculateShensha(dayPillar.gan, yearPillar.zhi, monthPillar.zhi, dayPillar.zhi);
  
  // 从四柱推算年份（简化处理，取当前年份）
  const currentYear = new Date().getFullYear();
  
  // 计算流年
  const liunian = calculateLiunian(currentYear);
  
  // 计算流月
  const liuyue = calculateLiuyue(currentYear);
  
  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    hiddenGan,
    wuxing,
    dayun: [], // 从四柱无法准确计算大运，需要具体日期
    qiyunAge: { years: 0, months: 0, days: 0 },
    shensha,
    liunian,
    liuyue
  };
};

module.exports = {
  calculateBazi,
  calculateFromSizhu,
  TIAN_GAN,
  DI_ZHI
};

