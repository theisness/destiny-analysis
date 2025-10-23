#!/usr/bin/env bash
set -euo pipefail

# 批量上传：算准网·名人库
# 按输入优先级选择：若有农历则用 inputType=lunar；若有公历则用 inputType=gregorian；否则用 inputType=sizhu
# 使用：API_BASE=http://localhost:5000 JWT="<token>" bash scripts/upload_suanzhun_bazi_1_8.sh

API_BASE=${API_BASE:-"http://localhost:5000"}
JWT=${JWT:-""}

if [[ -z "$JWT" ]]; then
  echo "[错误] 请先在环境变量 JWT 中设置有效的 Bearer Token"
  echo "示例：$ export JWT=eyJ..."
  exit 1
fi

make_labels() {
  local arr=("名人" "来源:算准网" "$@")
  local json='['
  local first=true
  for item in "${arr[@]}"; do
    if [[ -n "$item" ]]; then
      if [ "$first" = true ]; then
        first=false
      else
        json+=','
      fi
      json+='"'"$item"'"'
    fi
  done
  json+=']'
  echo "$json"
}

branch_to_hour() {
  case "$1" in
    子) echo 0;;
    丑) echo 2;;
    寅) echo 4;;
    卯) echo 6;;
    辰) echo 8;;
    巳) echo 10;;
    午) echo 12;;
    未) echo 14;;
    申) echo 16;;
    酉) echo 18;;
    戌) echo 20;;
    亥) echo 22;;
    *) echo 0;;
  esac
}

post_lunar() {
  local name="$1" gender="$2" y="$3" m="$4" d="$5" hr="$6" min="$7" leap="$8"; shift 8
  local labels_json; labels_json=$(make_labels "$@")
  local hr_val="$hr"
  if ! [[ "$hr" =~ ^[0-9]+$ ]]; then
    hr_val=$(branch_to_hour "$hr")
  fi
  curl -sS --fail-with-body -X POST "$API_BASE/api/bazi" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT" \
    --data-binary @- <<JSON
{"name":"$name","gender":"$gender","inputType":"lunar","lunarDate":{"year":$y,"month":$m,"day":$d,"hour":$hr_val,"minute":$min,"isLeapMonth":$leap},"addToCommunity":true,"labels":$labels_json}
JSON
  echo "[OK] 农历：$name（$y-$m-$d $hr_val:$min）"
}

post_gregorian() {
  local name="$1" gender="$2" y="$3" m="$4" d="$5" hr="$6" min="$7"; shift 7
  local labels_json; labels_json=$(make_labels "$@")
  local hr_val="$hr"
  if ! [[ "$hr" =~ ^[0-9]+$ ]]; then
    hr_val=$(branch_to_hour "$hr")
  fi
  curl -sS --fail-with-body -X POST "$API_BASE/api/bazi" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT" \
    --data-binary @- <<JSON
{"name":"$name","gender":"$gender","inputType":"gregorian","gregorianDate":{"year":$y,"month":$m,"day":$d,"hour":$hr_val,"minute":$min},"addToCommunity":true,"labels":$labels_json}
JSON
  echo "[OK] 公历：$name（$y-$m-$d $hr_val:$min）"
}

post_sizhu() {
  local name="$1" gender="$2" ytg="$3" mtg="$4" dtg="$5" htg="$6"; shift 6
  local labels_json; labels_json=$(make_labels "$@")
  curl -sS --fail-with-body -X POST "$API_BASE/api/bazi" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT" \
    --data-binary @- <<JSON
{"name":"$name","gender":"$gender","inputType":"sizhu","sizhu":{"year":"$ytg","month":"$mtg","day":"$dtg","hour":"$htg"},"addToCommunity":true,"labels":$labels_json}
JSON
  echo "[OK] 四柱：$name（$ytg $mtg $dtg $htg）"
}

# 以日历时间（农历优先，其次公历）上报，缺时辰用时支推算整点
post_gregorian "科比·布莱恩特" "男" 1978 8 23 辰 0 "篮球运动员"
post_gregorian "李兆基" "男" 1928 2 20 丑 0 "企业家" "富豪"
post_lunar "宋太宗赵光义" "男" 939 10 7 寅 0 false "皇帝"
post_gregorian "赵一荻" "女" 1912 5 28 卯 0 "名媛" "张学良妻子"
post_lunar "白居易" "男" 772 1 20 寅 0 false "诗人" "唐朝"
post_lunar "嘉庆皇帝" "男" 1760 10 6 丑 0 false "皇帝"
post_lunar "张居正" "男" 1525 5 3 卯 0 false "政治家" "明朝"
post_gregorian "徐世昌" "男" 1855 10 20 辰 0 "政治家" "中华民国总统"
post_lunar "明神宗（朱翊钧）" "男" 1563 8 27 酉 0 false "皇帝"
post_gregorian "王阳明" "男" 1472 10 31 亥 0 "思想家" "哲学家" "军事家" "教育家" "明朝"
post_gregorian "纳兰性德" "男" 1655 1 19 申 0 "词人" "清朝"
post_lunar "张廷玉" "男" 1672 9 9 辰 0 false "政治家" "清朝"
post_gregorian "韦千里" "男" 1911 3 31 辰 0 "命理学家"
post_gregorian "琼瑶" "女" 1938 4 20 丑 0 "作家" "编剧"
post_lunar "陈果夫" "男" 1892 9 7 申 0 false "政治家" "国民党"
post_gregorian "拿破仑" "男" 1769 8 15 亥 0 "皇帝" "军事家" "时辰存疑"
post_gregorian "邵雍" "男" 1012 1 21 戌 0 "哲学家" "易学家" "北宋"
post_gregorian "章太炎" "男" 1869 1 12 申 0 "学者" "革命家"
post_gregorian "钱钟书" "男" 1910 11 21 16 0 "作家" "学者"
post_gregorian "多尔衮" "男" 1612 11 17 寅 0 "政治家" "军事家" "清朝"
post_gregorian "林徽因" "女" 1904 6 10 丑 0 "建筑家" "作家" "诗人"
post_gregorian "杜甫" "男" 712 2 12 亥 0 "诗人" "唐朝"
post_gregorian "胡适" "男" 1891 12 17 未 0 "学者" "思想家"
post_gregorian "冯玉祥" "男" 1882 11 6 午 0 "军事家" "军阀"
post_gregorian "普京" "男" 1952 10 7 午 0 "政治家" "俄罗斯总统" "时辰存疑"
post_gregorian "何鸿燊" "男" 1921 11 25 午 0 "企业家" "赌王" "时辰存疑"
post_gregorian "李嘉诚" "男" 1928 7 29 亥 0 "企业家" "富豪"
post_gregorian "郭沫若" "男" 1892 11 16 午 0 "文学家" "历史学家"
post_gregorian "康有为" "男" 1858 3 19 子 0 "思想家" "政治家" "清朝"
post_gregorian "黎元洪" "男" 1864 10 19 辰 0 "政治家" "中华民国总统"
post_gregorian "南怀瑾" "男" 1918 3 18 亥 0 "学者" "国学大师"
post_gregorian "盛宣怀" "男" 1844 11 4 寅 0 "企业家" "政治家" "清朝"
post_gregorian "鲁迅" "男" 1881 9 25 寅 0 "作家" "思想家"
post_gregorian "袁世凯" "男" 1859 9 16 未 0 "政治家" "中华民国大总统"
# 仍保留四柱上报：日期不详的条目
post_sizhu "于右任" "男" "己卯" "戊辰" "甲子" "壬申" "政治家" "书法家"
post_sizhu "蔡京" "男" "丁亥" "壬寅" "壬辰" "辛亥" "政治家" "书法家" "北宋"
post_sizhu "丁士美" "男" "辛巳" "壬辰" "己未" "戊辰" "状元" "明朝"
post_sizhu "陆游" "男" "乙巳" "丁亥" "甲寅" "丁卯" "诗人" "南宋"
post_sizhu "宋徽宗赵佶" "男" "壬戌" "丙午" "乙酉" "庚辰" "皇帝" "艺术家" "书法家"
post_sizhu "郑板桥" "男" "癸酉" "癸亥" "乙未" "丙子" "书画家" "文学家" "清朝"
post_sizhu "同治皇帝" "男" "丙辰" "壬辰" "庚辰" "庚辰" "皇帝"
post_sizhu "阮玲玉" "女" "庚戌" "辛巳" "己亥" "乙亥" "演员"
post_sizhu "忽必烈" "男" "乙亥" "乙酉" "乙酉" "乙酉" "皇帝" "元朝" "时辰存疑"
post_sizhu "傅行简" "男" "戊子" "甲寅" "甲寅" "甲子" "状元" "南宋"
post_sizhu "郭子仪" "男" "丁酉" "己酉" "戊寅" "戊午" "军事家" "唐朝"
post_sizhu "范蠡" "男" "丙寅" "己亥" "庚申" "辛巳" "政治家" "商人" "春秋"
post_sizhu "韩信" "男" "辛酉" "丁酉" "乙卯" "乙酉" "军事家" "汉朝"
post_sizhu "廖仲恺" "男" "戊寅" "丙辰" "庚申" "辛巳" "革命家" "国民党"
post_sizhu "岳飞" "男" "癸未" "乙卯" "甲子" "己巳" "军事家" "南宋"
post_sizhu "孔祥熙" "男" "庚辰" "乙酉" "癸卯" "庚申" "银行家" "政治家" "国民党"
post_lunar "顺治皇帝" "男" 1638 1 30 20 0 false "皇帝"
post_lunar "弘一法师李叔同" "男" 1880 9 20 8 0 false "艺术家" "僧人"
post_gregorian "杜月笙" "男" 1888 8 22 12 0 "黑帮" "企业家"
post_gregorian "王安石" "男" 1021 11 12 8 0 "政治家" "文学家" "北宋"
post_gregorian "袁崇焕" "男" 1584 6 6 20 0 "军事家" "明朝"
post_gregorian "海瑞" "男" 1514 1 22 10 0 "官员" "明朝"
post_gregorian "洪承畴" "男" 1593 10 16 0 0 "官员" "明朝" "清朝"
post_gregorian "曾国藩" "男" 1811 11 26 22 0 "政治家" "军事家" "清朝"
post_lunar "纪晓岚" "男" 1724 6 15 12 0 false "学者" "官员" "清朝"
post_lunar "李莲英" "男" 1848 10 17 8 0 false "太监" "清朝"
post_lunar "曹雪芹" "男" 1715 4 26 0 0 false "作家" "《红楼梦》作者"
post_lunar "康熙皇帝" "男" 1654 3 18 10 0 false "皇帝"
post_lunar "刘伯温" "男" 1311 6 15 12 0 false "军事家" "政治家" "明朝"
post_lunar "唐太宗李世民" "男" 599 12 21 20 0 false "皇帝"
post_gregorian "武则天" "女" 624 2 20 20 0 "皇帝" "时辰存疑"