# My Game Tools Design System

## Design Intent

统一视觉气质参考 `ef.yituliu.cn`，但不做页面复刻。目标是稳定、克制、具备工业感的数据工具界面。

## Visual Direction

- Light-first with dark parity
- 灰阶主色，不依赖高饱和品牌色
- 强结构卡片，明确的层级分区
- 大圆角，但不做软萌风
- 允许局部玻璃感与条纹装饰，强调技术感与器械感
- 动效短促清晰，服务于页面进入、卡片浮起和状态切换

## Color Tokens

- 背景：雾白、浅灰、炭灰三层递进
- 文本：炭黑主文本、石墨灰次文本、浅灰辅助文本
- 边框：低对比细边框 + 局部强调边框
- 强调色：只用于焦点、选中、状态点，不作为大面积底色
- 禁止：紫色 SaaS 默认主题、蓝紫渐变主视觉、纯白空洞页面

## Typography

- 首选：`HarmonyOS Sans SC`
- 回退：`Noto Sans SC`, `Segoe UI`, `system-ui`, `sans-serif`
- 标题粗壮、字距略收紧
- 正文保持高可读性，不走营销站超轻字重

## Layout

- 顶层采用门户页 + 工具工作台模式
- 页面宽度以舒适阅读和数据操作并重
- 区块必须通过卡片、面板或边框形成明确边界
- 留白存在，但不能做成空旷展示页

## Components

- `AppShell`：统一页面框架、主题切换、顶部导航
- `PageHeader`：标题、说明、动作区
- `ToolCard`：门户工具入口卡
- `Panel`：工作区分块容器
- `FilterBar`：筛选与动作区
- `StatCard`：结果摘要
- `DataTable`：数据表格与结果列表
- `PrimaryButton` / `SecondaryButton`：统一按钮语气
- `StatusBadge`：统一状态表达

## Surface Treatment

- 卡片采用大圆角与柔和阴影
- 允许顶部或侧边增加细条纹装饰
- 允许浅层玻璃感，但不能降低信息可读性
- 鼠标悬停以轻微上浮和阴影变化为主

## Motion

- 进入动画：8px 到 16px 位移 + 透明度淡入
- 卡片 hover：轻微阴影和位移
- 主题切换：颜色过渡而非夸张翻转
- 禁止：过度弹跳、长时旋转、炫技动效

## Do / Do Not

- Do：做成稳定的工具界面，强调信息组织和操作效率
- Do：让不同工具看起来属于同一套产品
- Do：在标题、卡片、表格和筛选区维持一致节奏
- Do Not：让每个工具自带一套品牌色
- Do Not：把页面做成白板式原型
- Do Not：引入通用模板站的默认配色和默认按钮风格
