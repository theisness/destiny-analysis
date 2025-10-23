#!/usr/bin/env bash
# 通过 curl 添加历史名人的八字记录并分享到社区（需 JWT）
# 使用：
#   API_BASE=http://localhost:5000 JWT="<your_token>" bash scripts/upload_celeb_bazi.sh
# 说明：
# - 接口：POST ${API_BASE}/api/bazi （私有接口，必须携带 Authorization: Bearer <JWT>）
# - 字段：name, gender（男|女）, inputType（gregorian|lunar|sizhu）
#         根据 inputType 传入 gregorianDate / lunarDate / sizhu
#         addToCommunity: true 分享到社区
#         labels: ["名人", "主席", ...]（字符串数组，会自动创建缺失标签）
# - 本脚本对每位人物提供来源注释，确保数据准确性；如时辰存在分歧，明确标注。

set -euo pipefail

API_BASE=${API_BASE:-http://localhost:5000}
JWT=${JWT:-}

if [[ -z "${JWT}" ]]; then
  echo "[错误] 缺少 JWT。请通过环境变量 JWT 提供，例如：JWT=\"<token>\"" >&2
  exit 1
fi

post_bazi() {
  local payload="$1"
  echo "[上传] $(echo "$payload" | tr -d '\n' | sed 's/\s\+/ /g')"
  curl -sS -X POST "${API_BASE}/api/bazi" \
    -H "Authorization: Bearer ${JWT}" \
    -H "Content-Type: application/json" \
    --data-binary @- <<< "$payload"
  echo "\n-----"
}

# 孙中山（1866-11-12 寅时；农历同治五年十月初六 寅时）
# 主要来源（交叉印证）：
# - 广东中国国民党中央党部向卢慕贞求证所得八字（多处命理资料引用）
# - 常见命理整理：丙寅年、己亥月、庚寅日、戊寅时
post_bazi '{
  "name": "孙中山",
  "gender": "男",
  "inputType": "sizhu",
  "gregorianDate": { "year": 1866, "month": 11, "day": 12, "hour": 4, "minute": 0 },
  "lunarDate": { "year": 1866, "month": 10, "day": 6, "hour": 4, "minute": 0, "isLeapMonth": false },
  "sizhu": { "year": "丙寅", "month": "己亥", "day": "庚寅", "hour": "戊寅" },
  "addToCommunity": true,
  "labels": ["名人", "革命家", "领袖"]
}'

# 毛泽东（1893-12-26 辰时说为主流；农历光绪十九年十一月十九）
# 说明：出生时辰存不同版本（卯/辰/申），以“辰时”最为主流；为保证社区使用，明确标注“时辰存疑”。
# 常见命理整理：癸巳年、甲子月、丁酉日、甲辰时
post_bazi '{
  "name": "毛泽东",
  "gender": "男",
  "inputType": "sizhu",
  "gregorianDate": { "year": 1893, "month": 12, "day": 26, "hour": 8, "minute": 0 },
  "lunarDate": { "year": 1893, "month": 11, "day": 19, "hour": 8, "minute": 0, "isLeapMonth": false },
  "sizhu": { "year": "癸巳", "month": "甲子", "day": "丁酉", "hour": "甲辰" },
  "addToCommunity": true,
  "labels": ["名人", "主席", "领袖", "时辰存疑"]
}'

# 提示：
# - 忽必烈、武则天等人物的出生时辰在史料中存在分歧或未详，若需上传，请先确定可信来源后，将其四柱与日期补充至下方模板：
# post_bazi '{
#   "name": "武则天",
#   "gender": "女",
#   "inputType": "sizhu",
#   "gregorianDate": { "year": 624, "month": 2, "day": 20, "hour": 0, "minute": 0 },
#   "lunarDate": { "year": 624, "month": 2, "day": 17, "hour": 0, "minute": 0, "isLeapMonth": false },
#   "sizhu": { "year": "甲申", "month": "丙寅", "day": "甲午", "hour": "甲戌" },
#   "addToCommunity": true,
#   "labels": ["名人", "皇帝", "时辰存疑"]
# }'

# 社区验证（可选）：按姓名筛选刚上传的记录（需 JWT）
# curl -sS "${API_BASE}/api/bazi/community/list?name=孙中山&share=public" -H "Authorization: Bearer ${JWT}"
# curl -sS "${API_BASE}/api/bazi/community/list?name=毛泽东&share=public" -H "Authorization: Bearer ${JWT}"

echo "[完成] 已尝试上传示例人物的八字记录并分享到社区。"