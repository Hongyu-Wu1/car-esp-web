# 网页答辩展示 — 三轮车 · 摄像头智能小车

> **本文件的作用**：把"用 reactbits 做一个课程答辩展示网页"这件事完整交代清楚，方便接手。
> 这是一个**独立的公开仓库 `car-esp-web`**（不属于 `car-esp` 固件/算法代码，也用它在 GitHub Pages 上托管），
> 用于**电子系统设计课程交流答辩**的展示。

---

## 1. 背景与目标

- 作品：**三轮车 —— 摄像头智能小车**（ESP32-S3 + USB 摄像头，视觉离载到笔记本）。
- 课程：电子系统设计，**交流答辩**。老师允许**不是 PPT**，提交一个文件即可，**网页代码也可以**。
- 组别/成员：**第 16 组** — 沙也涵 · 王翊泽 · 吴泓谕。
- 答辩：汇报 8 分钟 + 提问 2 分钟；重点是挑创新点讲（怎么实现、主要问题、收获），不面面俱到。
- 核心思路：做一个**像 PPT 一样能"翻页"的网页**；可内嵌**循环播放**的演示视频（讲对应内容就放对应视频）。

---

## 2. 技术栈

- **Vite + React 18 + Tailwind CSS 3**。
- **reactbits 组件**（[reactbits.dev](https://reactbits.dev/get-started/index)）：`GradientText`（渐变流光标题）、`ShinyText`（金属反光副标题）。
- 视频作为**独立文件**（`import demo_line.mp4` → Vite 构建出 `dist/assets/*.mp4` + 相对引用），不再走单文件内联。

---

## 3. 当前功能（已能打开，已验证渲染）

- **翻页**（像 PPT）：键盘 `←`/`→` 翻页、**空格**下一页、`Home`/`End` 跳首末；底部"上一页/下一页 + 圆点指示 + 页码"；地址栏 **`#p1`/`#p2`** 直达某页、支持浏览器前进后退；翻页有**淡入+右移过渡**（`src/index.css` 的 `.page-enter`）。
- **已有两页**：
  - **P1 封面**：组别 → 渐变标题 → 流光副标题 → 小车图 → 组员 → "下一页·目录 →"。
  - **P2 目录**：`CONTENTS / 目录 · 三个创新点`（渐变标题）+ **三张卡片**（① 项目管理 / ② 架构 / ③ 算法，各配色渐变，点击 `go(i+2)` 预留跳目标内容页）+ "返回封面"。
- **reactbits 动画**：渐变标题、金属流光；`page-enter` 过渡。

---

## 4. 目录结构（仓库根 = `car-esp-web/`）

| 文件/目录 | 作用 |
|---|---|
| `package.json` / `package-lock.json` | npm 工程（dev/build/preview；依赖 react/react-dom；devDeps vite/@vitejs/plugin-react/tailwindcss/postcss/autoprefixer） |
| `vite.config.js` | Vite：`react` 插件 + **`base:'/car-esp-web/'`**（GitHub Pages 子路径） |
| `tailwind.config.js` | Tailwind 主题：配色(brand/accent/ink/fog)、字体、`keyframes`(shine/gradient)+`animations` |
| `postcss.config.js` | PostCSS：tailwind + autoprefixer |
| `.github/workflows/deploy.yml` | GitHub Actions：push 到 main → `npm ci && npm run build` → 发布 Pages |
| `.gitignore` | 忽略 `node_modules/`、`dist/` 等 |
| `index.html` | 页面壳（`#root` + 引 `src/main.jsx`） |
| `src/main.jsx` | React 入口 |
| `src/index.css` | Tailwind 指令 + `.page-enter` 翻页动画 |
| `src/App.jsx` | **核心**：封面页、目录页、**翻页逻辑**（键盘/按钮/hash/过渡），调 reactbits 组件 |
| `src/components/GradientText.jsx`、`ShinyText.jsx` | **reactbits 组件**（从官方仓库拷的源码，零依赖） |
| `src/assets/` | 车图 `car.png` + 三段 `demo_*.mp4` + `poster_demo_*.png`（内容页视频/封面） |
| `汇报内容_可复制.md` | 答辩内容文案（每页要点），写 P3–P8 的依据 |

---

## 5. 怎么跑 / 构建

```bash
cd car-esp-web
npm install          # 注意：本机 ~/.npm 有 root 所有文件会 EACCES，用：
                     #   NPM_CONFIG_CACHE=/tmp/npm-cache-$(id -u) npm install
npm run dev          # 开发模式 → 浏览器开 http://localhost:5173（热更新）
npm run build        # 构建 → dist/（多文件：index.html + assets/ 图片与视频）
npm run preview      # 本地预览构建产物
```

- 本地看效果建议用 `npm run dev`（或 `npm run preview`），因为 `base:'/car-esp-web/'` 是给 GitHub Pages 子路径用的。
- 已用 **Vite 构建验证**两页正常渲染（有视频的资料已复制进 `src/assets/`，写内容页时 `import` 即可）。

---

## 6. 内容规划（待填，按"讲对应内容放对应视频"）

| 页 | 内容 | 视频（循环直到换页） |
|---|---|---|
| P1 | 封面 | — |
| P2 | 目录（创新点） | — |
| P3 | 创新① 项目管理：Git & GitHub 分支/提交（远端备份、多人协作、AI `rm` 删库教训） | — |
| P4 | 创新② 架构：`ESP32(采集+执行)→WiFi→笔记本(计算+实时显示)`，C/py 分层 + 最后一提交的文件关系树 | —（架构页不放巡线视频） |
| P5 | 创新③ 巡线：种子连通域 + Otsu 自适应阈值（抗光照） | **demo_line.mp4** |
| P6 | 创新③ 避障：左移绕板 + 双反馈（距离固定才能硬编码） | **demo_avoid.mp4** |
| P7 | 创新③ 推球：动态 HSV（Hue 环形 + 三槽调色台 + 圆度/面积过滤） | **demo_strike.mp4** |
| P8 | 总结：收获 + 一句话 + Q&A | — |

- **视频"循环播放直到换页"**：用 HTML `<video src="..." loop muted autoplay>`（网页原生循环，符合要求）。
- 内容文案可直接照 `汇报内容_可复制.md`（本仓库根，含每页要点）。

---

## 7. 素材（已在 `car-esp-web/src/assets/` 内）

| 文件 | 说明 |
|---|---|
| `demo_line.mp4` | 巡线片段 3–14s（11s） |
| `demo_avoid.mp4` | 左移避障片段 19–21s（2s） |
| `demo_strike.mp4` | 击球片段 37–46s（9s） |
| `poster_demo_*.png` | 各片段抽帧缩略图（用作 `<video poster>`） |
| `car.png` | 小车草图（封面图） |

> 原始 86s 视频 `第一视角_avc1.mp4` 属旧素材，已随旧 PPT 一起归档到 `legacy_ppt/`，不在本仓库。

---

## 8. 部署到 GitHub Pages（关键）

- 背景：`car-esp` 仓库是 **private**，GitHub Pages 免费版要求 **public**。所以另建公开仓库 `car-esp-web` 来放本网页。
- 本仓库已备好 **GitHub Actions**（`.github/workflows/deploy.yml`）+ **`base:'/car-esp-web/'`**，push 到 `main` 自动构建并发布。
- 发布步骤（**需你登录的 `gh` / 凭据**）：
  1. 建公开仓库并推上去：
     ```bash
     gh repo create car-esp-web --public --source . --remote origin --push
     ```
     （或先 `git add/.·git commit` 后，在 GitHub 手动建空 public 仓库再把本仓库 push 上去。）
  2. 仓库 Settings → Pages → Source 选 **"GitHub Actions"**。
- **`base` 路径说明**：项目仓库（`https://<user>.github.io/car-esp-web/`）→ `base:'/car-esp-web/'`（**已设对**）；
  若改用用户主页仓库（`<user>.github.io`，同 TyperMonkie 那种）→ 改 `base:'/'`。
- 备选简单法：`npm run build` 后把 `dist` 推到 `gh-pages` 分支（Settings → Pages → Deploy from a branch → gh-pages/root）。

---

## 9. 环境 / 踩坑记录

- **npm 缓存 EACCES**：本机 `~/.npm` 有 root 所有文件，`npm` 报错。用 `NPM_CONFIG_CACHE=/tmp/npm-cache-$(id -u) npm install`。
- **reactbits 组件**：jsrepo CLI 有交互式 + 写 `~/.config` + `paths` 配置不生效等坑。**组件源码是从 reactbits 官方仓库 tar 包手动拷的**（`src/tailwind/TextAnimations/GradientText/GradientText.jsx`、`ShinyText.jsx`，零依赖）。
- **Tailwind 动画**：`GradientText`/`ShinyText` 需要 `@keyframes gradient/shine`，已在 `tailwind.config.js`。
- **ffmpeg**：用于裁视频（已建立三段 demo_*.mp4）。命令示例：`ffmpeg -i src.mp4 -filter_complex "[0:v]trim=start=6:end=9,setpts=PTS-STARTPTS[v]" -map "[v]" -c:v libx264 -preset fast -pix_fmt yuv420p -movflags +faststart out.mp4`。
- **headless 截图**：Chrome 无头截屏会被沙箱拦（写 `~/.config`/dconf），需 `--no-sandbox --user-data-dir=/tmp/xxx` + `HOME=/tmp/xxx`；实际浏览器打开没问题。
- **旧 PPT 方案**（已归档到 `legacy_ppt/`）：`build_ppt.py` + `三轮车-第16组.pptx`（python-pptx）与 `node_modules`（marp-cli）都是另一条线的遗留，不在本仓库。

---

## 10. 一句话总结给接手者

> 这是一个 **Vite + React + Tailwind + reactbits** 的翻页展示网页，已备成**独立 public 仓库 `car-esp-web`**（.gitignore / deploy.yml / base 路径已配好）。
> **已能打开**（封面 + 目录 + 翻页）。下一步是**填三个创新点内容页 P3–P8 + 三段循环视频**，然后**新建公开 GitHub 仓库并 push 到 main**（Actions 自动发布 Pages）。文案在仓库根 `汇报内容_可复制.md`，视频/封面素材在 `src/assets/`。
