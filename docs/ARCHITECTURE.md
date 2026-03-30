# Architecture

## 技术原则
- 纯前端静态部署
- UMD 命名空间组织
- Phaser 负责游戏循环与场景切换
- 游戏内容尽量配置化

## 核心模块
- `js/core`：基础设施与配置
- `js/managers`：玩家、战斗、世界、事件、存档等管理器
- `js/scenes`：页面与核心流程场景
- `assets/data/worlds/wuxia`：武侠世界数据

## 流程
`Boot -> Preload -> MainMenu -> CreateRole -> WorldMap -> Event/Battle/Town -> Ending`

## 扩展原则
新增世界时尽量只新增：
- 数据目录
- 世界控制器与规则
- 少量入口 UI

避免直接修改基础场景的公共逻辑。
