# esp智能车 · 课程答辩展示网页

一个 **Vite + React + Tailwind CSS** 做的单页"翻页"展示网页，用于电子系统设计课程的**交流答辩**（8 分钟汇报 + 2 分钟提问）。像 PPT 一样按 `←`/`→` 翻页，可内嵌循环演示视频。

**作品**：ESP32-S3 + USB 摄像头智能小车，视觉离载到笔记本；实现 循迹 / 避障 / 停车 / 自动双球入洞。
**组别**：第 16 组 · 沙也涵 / 王翊泽 / 吴泓谕。

---

## 在线预览

部署后：`https://hongyu-wu1.github.io/car-esp-web/`（GitHub Pages）

## 技术栈

- **Vite + React 18 + Tailwind CSS 3**
- 设计风格借鉴 [typermonkie.github.io](https://typermonkie.github.io/#top)：近黑底 `#050607` + 青绿点缀 `#62f1d1`、细体大字、网格 + 径向辉光 + 粒子背景
- 自写轻量组件：`Particles`（2D 粒子场）、`GitGraph`（git 分支历史图）
- 视频为独立文件（`import demo_line.mp4` → `dist/assets/*.mp4`）

## 内容（7 页）

| 页 | 内容 |
|---|---|
| P1 | 封面 |
| P2 | 目录 · 三个创新点 |
| P3 | 创新① 项目管理（Git 分支历史图） |
| P4 | 创新② 架构（ESP→WiFi→笔记本） |
| P5–P7 | 创新③ 算法：巡线 / 避障 / 推球（各配循环视频） |

## 运行 / 构建

```bash
npm install        # 若 npm 缓存报 EACCES，用：NPM_CONFIG_CACHE=/tmp/npm-cache-$(id -u) npm install
npm run dev        # 开发预览 → http://localhost:5173
npm run build      # 构建 → dist/
npm run preview    # 本地预览构建产物
```

## 部署到 GitHub Pages

仓库已内置 `.github/workflows/deploy.yml`：push 到 `main` 自动 `npm ci && npm run build` 并发布。
仓库 **Settings → Pages → Source** 选 **GitHub Actions** 即可。`vite.config.js` 的 `base` 已按本项目仓库名设为 `/car-esp-web/`。

## 目录结构

```
src/
  App.jsx            7 页内容 + 翻页逻辑
  index.css          主题（配色/排版/动效）
  components/        Particles · GitGraph
  assets/            车图 + 四段演示视频 + 缩略图
index.html           页面壳
.github/workflows/deploy.yml   GitHub Pages 发布
```

> 详细的项目记忆 / 踩坑记录见本地 `memory.md`（已 gitignore，不入库）。
