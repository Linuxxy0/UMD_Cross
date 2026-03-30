# Content Pipeline

## 事件
事件统一写入 `assets/data/worlds/wuxia/events.json`。
建议字段：
- `id`
- `title`
- `desc`
- `choices`
- `conditions`
- `effects`
- `next`

## 物品
统一在 `items.json` 中维护，装备必须明确：
- `slot`
- `rarity`
- `stats`
- `price`

## 技能
统一在 `skills.json` 中维护，必须包含：
- 类型
- 消耗
- 数值系数
- 学习条件

## NPC
NPC 建议至少提供：
- 身份
- 势力
- 关系定位
- 可触发事件
