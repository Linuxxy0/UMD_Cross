## 2.0.0 - 2026-03-31

- Reframed the project around a Steam-inspired indie RPG terminal presentation with calmer contrast, sharper information hierarchy, and a cleaner typography-led UI shell.
- Refined the shell, drawers, windows, buttons, logs, and status panels so the game feels like an always-running narrative interface instead of a browser showcase page.
- Restyled inventory, skills, map, and related panes into more restrained two-pane windows with cleaner list states, quality framing, and command-focused interaction.
- Updated scene copy and framing across menu, character creation, world, event, and battle scenes to match the new minimal terminal tone.

## 1.9.0 - 2026-03-31

- 重构默认进入流程：加载完成后不再先到首页或展示页，而是直接恢复当前进程，或直接进入创建角色界面。
- 主游戏界面改为三栏 MUD 终端布局，强调文字叙事、状态面板与上下文，而不是页游式首页门面。
- 建立新的视觉 token：深色低饱和、细线框、直角、极轻阴影、排版优先。
- 创建角色、事件、战斗、结局和主场景统一为同一套终端化 UI 语言。
- 保留左右抽屉和弹窗系统，但整体收束为更克制的窗格与信息面板风格。

# Changelog

## v1.9.0 - 2026-03-31
- 新增更接近 DNF 的装备格子框体、品质边框与更密实的直角金属线条 UI。
- 背包与商城加入分页仓库浏览，分类列表不再无限拉长。
- 个人信息窗口与背包条目接入拖拽换装，可直接把装备拖到武器 / 护甲 / 饰品槽位。
- 新增 4 格技能快捷栏，技能窗口支持拖拽分配，主界面同步显示当前快捷技能。
- 存档键升级为 `transmigrator_wuxia_save_v190`。

## v1.7.0 - 2026-03-31
- 强化整项目为更硬朗的直角 UMD 线条界面，统一窗口、按钮、标签、提示框和侧栏的金属边框风格。
- 背包窗口改造成更接近 DNF 仓库的双栏弹窗，新增分类标签、图标位、直角列表项和更清晰的右侧预览区。
- 商场窗口同步升级为 DNF 向货架界面，按装备 / 药品 / 其他分类浏览，并保留悬停预览与购买动作。
- 技能窗口加入招式 / 心法分类标签，并统一到与背包、商场一致的金属标题条和直角信息面板。
- 修正物品品质显示映射，使 white/green/blue/purple/orange 与 common/uncommon/rare/epic/legendary 两套口径都能正确显示。

## v1.6.0 - 2026-03-31

- 主菜单统一为 UMD 线条界面，改成真正的游戏内三列布局。
- 结局页统一为 UMD 线条界面，结算、继续探索和返回主菜单都在同一套框架中完成。
- 主菜单加入存档概览、启动须知、版本情报和世界概览，不再保留官网式英雄区。
- 结局页加入结局档案、通关情报和后续建议，同时保留左右小三角抽屉。
- 个人信息和后台窗口增加未建角状态兜底，避免主菜单阶段打开时报错。

# Changelog

All notable changes to this project will be documented in this file.

## [1.5.0] - 2026-03-31

### Added
- 将创建角色页重做为全屏 UMD 线条界面，统一为左档案列 / 中央创建区 / 右情报列布局。
- 事件页重做为 UMD 线条事件界面，接入侧边三角抽屉与统一的角色状态、情报列。
- 战斗页重做为 UMD 线条战斗界面，补充左右情报列、中央日志与战斗操作区。

### Changed
- 创建角色、事件、战斗三类场景的结构与主游戏界面统一，不再保留旧式原型页布局。
- 所有新场景继续复用 DNF 向暗金属弹窗皮肤与侧边抽屉式系统入口。
- 存档键升级为 `transmigrator_wuxia_save_v150`。

## [1.4.0] - 2026-03-30

### Added
- 新增统一道具库 `itemLibrary.json` 与装备库 `equipmentLibrary.json`。
- 新增版本公告数据 `announcements.json`，游戏内公告窗口按版本展示更新记录。
- 新增右上角系统侧拉三角，支持打开公告与后台窗口。
- 新增浮动装备 / 商品悬停提示面板。

### Changed
- 背包存储改为堆叠条目 + 装备实例化记录。
- 人物属性改为基础属性、装备加成、最终属性三层计算。
- 穿戴与卸下装备时自动重算人物属性并同步 UI。
- 存档键升级为 `transmigrator_wuxia_save_v140`。

## [1.3.0] - 2026-03-30

### Added
- 新增统一道具库 / 装备库。
- 新增右上角系统三角菜单与公告窗口。
- 新增游戏内后台窗口。

### Changed
- 装备穿脱改为属性联动重算。
- 公告改为按版本维护。

## [1.2.0] - 2026-03-30

### Added
- 主界面改为页游化布局，补齐个人信息、背包、商城、技能、地图五大入口。
- 新增 DNF 风格统一弹窗和悬停预览。

## [1.1.0] - 2026-03-30

### Added
- 新增版本页、徽章与 README 截图区。
- 仓库结构调整为可直接推送 GitHub 的正式项目仓库。

## [1.0.0] - 2026-03-30

### Added
- 建立 Phaser + UMD 武侠穿越页游工程结构。
- 接入 GitHub Pages 自动部署工作流。
- 完成武侠世界基础数据、主线、战斗和存档能力。
