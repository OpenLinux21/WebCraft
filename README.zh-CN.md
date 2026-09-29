# WebCraft

**隐私优先的纯静态网页设计与前端编程教学平台。**

[English](./README.md)

解压即可部署——无需服务器、无需账号体系、零遥测。你的学习进度、代码草稿和设置只保存在浏览器本地；AI 请求从你的浏览器直接发送到你自行配置的服务。

## 为什么选择 WebCraft

- **解压即部署。** 生产构建是纯 HTML/CSS/JS。把 `dist/`（或打包的 zip）丢到 GitHub Pages、Cloudflare Pages、Netlify、Vercel Static、Nginx、Apache——任何静态空间都能跑。站内链接全部是相对路径，`BASE_PATH=/子路径/ npm run build` 在子目录下也能工作。
- **隐私优先设计。** 零遥测、零分析、零项目方账号体系。学习进度、代码草稿、训练场记录、设置和 AI 配置全部保存在你的浏览器里（IndexedDB + localStorage），除非你*主动*导出或发送，否则数据永远不会离开你的设备。
- **你的 AI，你的密钥。** AI 助教从你的浏览器直接连接你配置的 Ollama 或任何 OpenAI 兼容 API。WebCraft 不内置任何 API Key，也没有中转服务器——请求不经过项目方的任何基础设施。
- **真实练习，安全沙箱。** 每节课都有 Monaco 驱动的 HTML/CSS/JS 工作台，实时预览运行在沙箱 iframe 里（仅 `allow-scripts`，无 `allow-same-origin`），带控制台捕获与运行时报错。
- **双语与主题。** 完整的英文与简体中文界面（路由前缀式，SEO 友好），Material Design 3 token，浅色 / 深色 / 跟随系统三态主题。

## 课程——24 节

从第一个 HTML 标签到完整可交互应用，难度从入门逐步提升到中等：

| 模块 | 课号 | 主题 |
| --- | --- | --- |
| HTML 基础 | 1–3 | 文档结构与标签 · 文本与语义 · 链接、图片、列表与媒体 |
| CSS 基础 | 4–7 | 选择器、层叠与继承 · 盒模型 · 颜色与排版 · 定位、层叠上下文与溢出 |
| 布局与响应式 | 8–11 | Flexbox · Grid · 媒体查询与响应式 · 过渡与动画 |
| JavaScript | 12–16 | 变量、类型与运算 · 函数、作用域与闭包 · 条件与循环 · 数组与对象 · 异步基础（Promise 与定时器，纯离线） |
| DOM 与交互 | 17–20 | DOM 查询与操作 · 事件 · 表单与客户端校验 · Web 存储 |
| 进阶专题 | 21–24 | 可访问性（语义、键盘、ARIA）· Material Design 3（token 与动态配色）· Web Components · 综合实战：交互式任务看板 |

每节课都包含学习目标、带可运行示例的知识讲解、练习任务与起始代码、三条递进提示、可载入编辑器的参考答案，以及完成状态跟踪。

## AI 助教

在训练场里，AI 可以生成挑战、点评代码、给出分阶段提示、陪你调试、讲解概念——五种模式（**提示 / 讲解 / 点评 / 调试 / 新挑战**）加自由提问。系统提示词已本地化，并明确要求模型**不得**直接给出完整答案。

**在 设置 → AI 助手 中配置一次：**

1. **服务商** — *Ollama（本地）* 或 *OpenAI 兼容 API*。
2. **Base URL** — 例如 `http://localhost:11434`（Ollama）或 `https://api.openai.com/v1`。
3. **模型名称** — 例如 `qwen2.5-coder:7b` 或 `gpt-4o-mini`。
4. **API Key** — 只保存在此浏览器，只发送给你配置的服务。可选自定义请求头、温度与最大输出 Token 数。
5. **测试连接** — 验证可达性并列出可用模型。

请求以流式（SSE / NDJSON）传输、可中止，并**从你的浏览器直连**你的服务。除非你明确勾选，API Key 不会写入备份。

> **CORS 与混合内容。** 浏览器强制跨域规则。Ollama 启动时需设置 `OLLAMA_ORIGINS` 为本站来源（或 `*`）。若本页通过 HTTPS 提供，浏览器会拦截发往 `http://` 地址的请求（混合内容）——请使用 `https://` 端点或将站点跑在本地。

## 本地数据与备份

- **存储：** IndexedDB 保存进度、草稿与训练场记录（带内存回退）；localStorage 保存简单设置与 AI 配置。存储适配器接口让这一层可替换（例如用户自备的云端适配器），默认无任何云端行为。
- **备份：** 设置 → *备份与恢复* 将全部数据导出为带版本号、可读的 JSON 文件（`webcraft-backup-<时间戳>.json`），导入时做 schema 校验、迁移注册表与逐条守卫。损坏条目被丢弃，过新版本被明确拒绝。**除非你显式勾选"包含敏感配置"，API Key 不会进入备份。**
- **删除全部：** 设置 → *数据* 在确认后清除所有本地数据。

## 开发上手

要求：**Node.js ≥ 20** 与 npm。

```bash
npm install        # 安装依赖
npm run dev        # 开发服务器（HMR）
npm run build      # 生产构建 → dist/
npm run preview    # 本地预览生产构建
npm run package    # 构建 + 打包 dist/ → release/webcraft-v<版本>.zip
```

质量门禁（全部接入 `npm run verify`）：

```bash
npm run lint        # ESLint（flat config，TS + Astro 插件）
npm run typecheck   # astro check（TypeScript 最严格）
npm run test        # Vitest 单元测试
npm run test:e2e    # Playwright 冒烟套件（针对生产构建）
npm run format      # Prettier
```

单元测试覆盖 i18n 字典（键与占位符齐平）、存储守卫与仓库、备份导出/导入/迁移、AI 请求构造与流解析、预览消息协议与文档构建器、课程进度状态机与内容完整性。Playwright 套件覆盖核心旅程：语言重定向、主题切换、工作台、控制台捕获、课程进度持久化、递进提示与设置页语言切换。

## 部署

默认构建面向站点根路径。`npm run package` 产出的 zip 文件位于压缩包根目录——解压到任意 Web 根目录即可。

**子目录部署**（如 GitHub Pages 项目站）用基础路径重新构建：

```bash
BASE_PATH=/my-repo/ npm run build && npm run package
```

站内链接全部相对，页面在任意深度都能工作；`BASE_PATH` 变量重定位哈希后的构建资源。已在纯静态服务器的 `/` 与子路径下验证通过。

## 项目结构

```
src/
  content.config.ts              # 内容集合 + zod schema
  content/courses/{en,zh-CN}/    # 24 节双语课程（MDX）
  content/exercises/<lessonId>/  # 每课的起始与参考代码
  lib/
    i18n/                        # 类型安全字典、翻译器、语言检测
    theme/                       # MD3 token、浅/深/系统控制器
    storage/                     # 适配器（IndexedDB/内存）、仓库、设置
    backup/                      # 版本化导出/导入 + 迁移
    editor/                      # Monaco 集成（懒加载）
    preview/                     # 沙箱文档构建器、消息协议、控制台
    ai/                          # Provider 抽象（OpenAI 兼容 + Ollama）、提示词
    courses/                     # schema、进度状态机、内容辅助
    playground/                  # 挑战任务类型
    utils/                       # 防抖、token、通用工具
  components/                    # Astro 组件（工作台、面板、区块）
  layouts/                       # BaseLayout（SEO meta、防闪烁主题脚本）
  pages/                         # 根跳转、404、[locale]/{首页,课程,课程详情,训练场,设置}
scripts/package.mjs              # zip 打包
e2e/                             # Playwright 冒烟套件
```

## 脚本

| 脚本 | 用途 |
| --- | --- |
| `dev` | Astro 开发服务器 |
| `build` | 生产构建 → `dist/` |
| `preview` | 本地预览生产构建 |
| `package` | 构建 + 打包 → `release/` |
| `test` / `test:watch` | Vitest 单元测试 |
| `test:e2e` | Playwright 冒烟套件 |
| `lint` / `lint:fix` | ESLint |
| `format` / `format:check` | Prettier |
| `typecheck` | `astro check` |
| `verify` | lint + typecheck + test + build |

## 共享 AI 模式（`serve:shared`）

在可信环境（家庭实验室、课堂、内网）中，可以让所有访客无需任何配置直接使用 AI 助教：

```bash
npm run build
# 创建 shared-ai.config.json（provider、baseUrl、model、apiKey 等）
npm run serve:shared   # 在 http://127.0.0.1:2020 上服务 dist/
```

若存在 `shared-ai.config.json`，服务器会把它发布为 `shared-ai.json`，站点进入共享模式：访客开箱即用 AI 助教（任意位置右键唤出），个人 AI 设置锁定。**API Key 对该站点的所有访客可见**——绝不要把此模式暴露到公网。没有该配置文件时，此命令就是一个普通静态文件服务器。`shared-ai.config.json` 已加入 gitignore。

## 安全说明

- 用户代码在沙箱 iframe 中运行（`allow-scripts`、**无** `allow-same-origin`，经 `srcdoc` 注入）；宿主页面从不 `eval` 用户代码。预览消息以每次运行随机 token + `event.source` 校验完成认证。
- API Key 保存在 localStorage，输入框为密码类型，报错与日志经脱敏处理，默认排除在备份之外。
- 运行时零第三方请求：字体、编辑器与全部资源本地打包。
- 所有数据留在设备上；唯一会发生的网络请求是你主动向自己配置的 AI 服务发起的请求。

## 贡献

小步提交，遵循 [Conventional Commits](https://www.conventionalcommits.org/)（`feat:`、`fix:`、`docs:`、`test:`、`chore:`）——一个 commit 只解决一类问题。提交前运行 `npm run verify`。界面文案、课程元数据与内容必须**双语同步**（i18n 齐平测试强制校验）。

## 许可证

[MIT](./LICENSE)
