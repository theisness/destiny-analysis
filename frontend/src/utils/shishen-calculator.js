/**
 * 十神计算工具函数
 */

// 判断天干阴阳
export const isYangGan = (gan) => {
  const yangGan = ['甲', '丙', '戊', '庚', '壬'];
  return yangGan.includes(gan);
};

// 获取天干五行
export const getGanWuxingType = (gan) => {
  const wuxingMap = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  return wuxingMap[gan] || '';
};

// 判断五行生克关系
export const getWuxingRelation = (myWuxing, otherWuxing) => {
  // 生我者为印，我生者为食伤，克我者为官，我克者为财，同我者为比劫
  if (myWuxing === otherWuxing) return '比劫';

  const shengRelation = {
    '木': '水',  // 水生木
    '火': '木',  // 木生火
    '土': '火',  // 火生土
    '金': '土',  // 土生金
    '水': '金'   // 金生水
  };

  const keRelation = {
    '木': '土',  // 木克土
    '火': '金',  // 火克金
    '土': '水',  // 土克水
    '金': '木',  // 金克木
    '水': '火'   // 水克火
  };

  if (shengRelation[myWuxing] === otherWuxing) return '印';
  if (shengRelation[otherWuxing] === myWuxing) return '食伤';
  if (keRelation[otherWuxing] === myWuxing) return '官';
  if (keRelation[myWuxing] === otherWuxing) return '财';

  return '';
};

// 计算十神
// isDayGan: 是否是日柱天干本身
export const getShishen = (riGan, otherGan, isDayGan = false) => {
  if (!riGan || !otherGan) return '';

  // 只有日柱天干本身才显示为"日主"
  if (isDayGan) {
    return '日主';
  }

  const riWuxing = getGanWuxingType(riGan);
  const otherWuxing = getGanWuxingType(otherGan);
  const relation = getWuxingRelation(riWuxing, otherWuxing);

  const riYang = isYangGan(riGan);
  const otherYang = isYangGan(otherGan);
  const sameYinYang = riYang === otherYang;

  // 根据关系和阴阳判断具体十神
  switch(relation) {
    case '比劫':
      return sameYinYang ? '比肩' : '劫财';
    case '印':
      return sameYinYang ? '偏印' : '正印';
    case '食伤':
      return sameYinYang ? '食神' : '伤官';
    case '官':
      return sameYinYang ? '七杀' : '正官';
    case '财':
      return sameYinYang ? '偏财' : '正财';
    default:
      return '';
  }
};

// 获取十神颜色
export const getShishenColor = (shishen) => {
  const colorMap = {
    '日主': '#8B0000',
    '比肩': '#8B4513',
    '劫财': '#A0522D',
    '食神': '#228B22',
    '伤官': '#32CD32',
    '偏财': '#FFD700',
    '正财': '#FFA500',
    '七杀': '#DC143C',
    '正官': '#FF6347',
    '偏印': '#4169E1',
    '正印': '#1E90FF'
  };
  return colorMap[shishen] || '#666';
};