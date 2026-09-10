import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import Particles from './components/Particles'
import GitGraph from './components/GitGraph'
import FileTree from './components/FileTree'
import carImg from './assets/car.png'
import lineVideo from './assets/demo_line.mp4'
import lineRealVideo from './assets/demo_line_real.mp4'
import avoidVideo from './assets/demo_avoid.mp4'
import strikeVideo from './assets/demo_strike.mp4'
import posterLine from './assets/poster_demo_line.png'
import posterLineReal from './assets/poster_demo_line_real.png'
import posterAvoid from './assets/poster_demo_avoid.png'
import posterStrike from './assets/poster_demo_strike.png'

/* ---------- 交接给下一位同学：只改这里 ---------- */
const NEXT_SLIDE = {
  url: 'https://typermonkie.github.io/#top', // ← 换成同学的站点地址
  label: 'typermonkie.github.io',            // 鼠标悬停提示里显示
}

/* 点圆环时才调用：预热对方站点。两条路一起走：
   ① 同站点（例：同学把页面挂在你账号的子路径 hongyu-wu1.github.io/xxx/）→ speculationrules 的
      prerender 能真的把对方页面提前渲染好，点进去是"瞬间"的；
   ② 跨站点（github.io 之间算不同 site —— github.io 在 Public Suffix List 里，Chrome 至今不支持
      跨站点 prerender，会打一条 console 警告）→ 退化成 preconnect + prefetch：只提前取回 HTML，
      **不执行对方 JS**，所以没有统计脚本 / 自动播放这类副作用。
   两条路都只在"点了圆环"之后才发生 —— 不点就什么都不做。 */
function warmNextSlide() {
  try {
    const origin = new URL(NEXT_SLIDE.url).origin
    const link = (rel, href, as) => {
      const l = document.createElement('link')
      l.rel = rel; l.href = href
      if (as) l.as = as
      if (rel === 'preconnect') l.crossOrigin = ''
      document.head.appendChild(l)
    }
    link('preconnect', origin)
    link('prefetch', NEXT_SLIDE.url, 'document')
  } catch { /* 配置写错也不影响正常跳转 */ }
  try {
    if (document.querySelector('script[type="speculationrules"]')) return
    const s = document.createElement('script')
    s.type = 'speculationrules'
    s.textContent = JSON.stringify({
      prerender: [{ source: 'list', urls: [NEXT_SLIDE.url], eagerness: 'immediate' }],
    })
    document.head.appendChild(s)
  } catch { /* 老浏览器不支持就靠上面那条 prefetch */ }
}

/* ---------- 通用小部件 ---------- */
function PageHeader({ eyebrow, title }) {
  return (
    <header className="mb-8">
      <p className="eyebrow left"><span />{eyebrow}</p>
      <h2 className="content-title mt-4">{title}</h2>
    </header>
  )
}

function Bullet({ children, center = false }) {
  if (center) {
    return (
      <li className="text-center text-white/80 text-[15px] md:text-[16.5px] leading-relaxed">
        <span className="mr-1.5 text-accent">●</span>{children}
      </li>
    )
  }
  return (
    <li className="flex gap-3">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_10px_#62f1d1]" />
      <span className="text-white/80 text-[15px] md:text-[16.5px] leading-relaxed">{children}</span>
    </li>
  )
}

function Card({ title, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6 backdrop-blur ${className}`}>
      {title && <h3 className="mb-3 text-base md:text-[17px] font-semibold tracking-[0.12em] text-accent">{title}</h3>}
      {children}
    </div>
  )
}

function VideoPanel({ src, poster, caption }) {
  return (
    <figure className="relative z-20 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
      <video className="aspect-video w-full object-cover" src={src} poster={poster} loop muted autoPlay playsInline controls />
      {caption && <figcaption className="px-4 py-2 text-center text-xs text-white/50">{caption}</figcaption>}
    </figure>
  )
}

/* ---------- P1 封面（借鉴 typermonkie hero） ---------- */
function CoverPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* 背景：粒子 + 环境圆环 */}
      <div className="absolute inset-0 z-0" aria-hidden="true"><Particles /></div>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      {/* 顶部品牌 */}
      <div className="absolute top-6 left-8 z-10 flex items-center gap-3 text-[.76rem] font-semibold tracking-[.25em] text-white/80">
        <span className="inline-flex h-[24px] items-end gap-[3px]" style={{ transform: 'skewY(-16deg)' }} aria-hidden="true">
          <i className="block h-[45%] w-[7px] border border-current" />
          <i className="block h-[68%] w-[7px] border border-accent bg-accent" />
          <i className="block h-full w-[7px] border border-current" />
        </span>
        <span>esp智能车</span>
      </div>

      <div className="relative z-10 max-w-5xl">
        <p className="eyebrow"><span />第 16 组 · 电子系统设计 · 交流答辩</p>

        <h1 className="hero-title mt-6">esp智能车</h1>

        <p className="hero-note mt-5">视觉 + 离载架构 · 循迹 / 避障 / 停车 / 自动双球入洞</p>

        <div className="mt-8 flex justify-center">
          <img src={carImg} alt="esp智能车"
            className="w-52 md:w-72 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(98,241,209,0.22)]" />
        </div>

        <p className="muted mt-7 text-xs md:text-sm tracking-[.18em]">沙也涵 · 王翊泽 · 吴泓谕</p>
      </div>

      {/* 底部状态行 */}
      <div className="absolute bottom-14 left-8 z-10 hidden items-center gap-3 text-[.64rem] tracking-[.18em] text-white/45 md:flex">
        <span>VISION / MOTION / CONTROL</span>
        <span className="flex h-px w-8 overflow-hidden bg-white/10"><i className="block h-full w-2/5 bg-accent animate-[signal_2s_ease-in-out_infinite]" /></span>
        <span>SYSTEM ONLINE</span>
      </div>
    </div>
  )
}

/* ---------- P2 目录 ---------- */
const toc = [
  { n: '①', title: '项目管理', desc: 'Git & GitHub 分支 / 提交管理，远端备份', tag: 'GIT', color: 'text-accent border-accent/40' },
  { n: '②', title: '架构', desc: 'ESP 采集执行 + 笔记本计算 & 实时显示\nC / py 分层', tag: 'ARCH', color: 'text-[#9b6cff] border-[#9b6cff]/40' },
  { n: '③', title: '算法', desc: '巡线 / 避障 / 推球\n自适应阈值 + 多反馈 + 动态 HSV', tag: 'VISION', color: 'text-[#ffd166] border-[#ffd166]/40' },
  { n: '④', title: '创意功能', desc: '智能体接入\n手势控制', tag: 'AI', color: 'text-[#f472b6] border-[#f472b6]/40' },
]

function TocPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16 pb-24">
      <p className="eyebrow"><span />CONTENTS</p>
      <h2 className="content-title mt-4">目录</h2>

      <div className="mt-10 grid w-full max-w-4xl gap-4 md:grid-cols-2">
        {toc.map((t) => (
          <div key={t.n}
            className={`rounded-2xl border bg-white/[0.04] p-6 text-left backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.07] ${t.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-light">{t.n}</span>
              <span className="rounded-full border px-2.5 py-0.5 text-[.6rem] tracking-[.2em]">{t.tag}</span>
            </div>
            <div className="mt-4 text-xl font-light text-white">{t.title}</div>
            <div className="mt-2 whitespace-pre-line text-sm text-white/60 leading-relaxed">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- P3 创新① 项目管理 ---------- */
function ProjPage() {
  return (
    <div className="relative min-h-screen px-6 pt-20 pb-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow="创新① · 项目管理" title="Git & GitHub 协作" />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="为什么用 Git & GitHub">
            <ul className="space-y-3">
              <Bullet>多人无法同时编辑同一份代码。</Bullet>
              <Bullet>去年 AI 一条 <code className="text-accent">rm</code> 把整个项目删了，本地没备份 → 没有远端保存就全没了。</Bullet>
            </ul>
          </Card>

          <Card title="做法">
            <ul className="space-y-3">
              <Bullet>用 <b className="text-white/90">分支 + 提交 + 推送</b> 到 GitHub 远端备份。</Bullet>
              <Bullet>每个功能开一个 feature 分支，验证通过后 merge 回 main。</Bullet>
              <Bullet>文档随代码一起提交；提交信息规范（功能 / 修复 / 重构…）。</Bullet>
            </ul>
          </Card>
        </div>

        <Card title="分支历史" className="mt-6">
          <GitGraph />
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#34d399]/40 px-2.5 py-0.5 text-[.62rem] text-[#34d399]">并入 main</span>
            <span className="rounded-full border border-dashed border-[#34d399]/60 px-2.5 py-0.5 text-[.62rem] text-[#34d399]">部分吸收</span>
            <span className="rounded-full border border-[#ffd166]/40 px-2.5 py-0.5 text-[.62rem] text-[#ffd166]">创新任务</span>
            <span className="rounded-full border border-[#fb7185]/40 px-2.5 py-0.5 text-[.62rem] text-[#fb7185]">被放弃</span>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ---------- P4 创新② 架构 ---------- */
const flow = [
  { t: 'ESP32-S3 · 采集 & 执行', d: '摄像头 / 超声 / 电机 / 舵机', c: '#9b6cff' },
  { t: 'WiFi · softAP + TCP', d: '原始 MJPEG 流 + 遥测(DIST/ENC)', c: '#ffd166' },
  { t: '笔记本 · 计算 & 实时显示', d: '巡线 / 避障 / 推球 / 录像', c: '#62f1d1' },
]

function ArchPage() {
  return (
    <div className="relative min-h-screen px-6 pt-12 pb-16 md:px-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow="创新② · 架构" title="ESP 采集执行 + 笔记本计算显示" />

        {/* 数据流 */}
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          {flow.map((f, i) => (
            <div key={f.t} className="flex flex-1 flex-col items-center gap-3 md:flex-row">
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center backdrop-blur">
                <div className="text-sm font-semibold" style={{ color: f.c }}>{f.t}</div>
                <div className="mt-1 text-xs text-white/60">{f.d}</div>
              </div>
              {i < flow.length - 1 && (
                <span className="text-accent text-xl md:px-2" aria-hidden="true">→</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[372px_minmax(0,1fr)]">
          <div className="space-y-4">
            <Card title="固件与算法分离">
              <ul className="space-y-2">
                <Bullet>MJPEG esp 解压：帧率 <b className="text-white/90">15fps</b>。</Bullet>
                <Bullet>优化传输，电脑解压：帧率 <b className="text-white/90">25fps</b>，<br />达相机拍摄速度。</Bullet>
                <Bullet>避免反复烧录。</Bullet>
              </ul>
            </Card>
            <Card title="录制：仿真 & 复盘">
              <ul className="space-y-2">
                <Bullet><code className="text-accent">sim/</code> 上线前仿真。</Bullet>
                <Bullet><code className="text-accent">record.py</code> 实时看参数 +<br />CSV 数据复盘。</Bullet>
              </ul>
            </Card>
          </div>
          <Card title="文件结构">
            <FileTree />
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ---------- P5 滚轴 + Python 着色（纯 JS，可单独跑测试） ---------- */
/* 滚轴几何：每栏高度**按内容自适应**（栏底不留白）；窗口高 = 当前两栏 + 缝隙 + 露出下一栏的一截
   露出量按"下一栏的一多半"取：栏高变矮后 120px 会把下一栏整栏都露出来，就不像"滚在下面"了 */
const LINE_GAP = 10
const LINE_PEEK = 80
const LINE_FALLBACK_H = 200 // 首帧兜底，量到真实高度前用

/* 由四栏实测高度算出：每栏的轨道 y 偏移 off[]、每档的窗口高 view[] */
function lineGeom(heights) {
  const off = []
  let acc = 0
  for (const h of heights) { off.push(acc); acc += h + LINE_GAP }
  const view = heights.map((h, s) => {
    const pair = s + 1 < heights.length ? h + LINE_GAP + heights[s + 1] : h
    /* 判据是"当前两栏下面还有没有栏"，而不是档位是不是最后一档：
       末尾那栏空栏占位就是靠这个才会在最后一档露出来 */
    const hasNext = s + 2 < heights.length
    return pair + (hasNext ? LINE_GAP + LINE_PEEK : 0)
  })
  return { off, view }
}
/* 档位：0 = ①②栏 + 视频1 · 1 = ②③栏 + 视频2 · 2 = ③④栏 + 代码 */
const LINE_STEPS = 3

/* 极简 Python 着色：逐位置试规则，命中就包 span，都不中按普通文字整段吃掉 */
const PY_RULES = [
  [/"""[\s\S]*?"""/y, 'text-[#8fd6a0]'], // 文档字符串
  [/#[^\n]*/y, 'text-white/35 italic'], // 注释
  [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y, 'text-[#8fd6a0]'], // 字符串
  [/\b(?:def|global|if|elif|else|for|in|is|not|and|or|return|while|import|from|class|lambda|pass|break|continue)\b/y, 'text-[#c792ea]'], // 关键字
  [/\b(?:None|True|False)\b/y, 'text-[#ff9e64]'], // 常量
  [/\b(?:abs|any|int|min|max|len|float|range|sum|round|print|bytes|bool)\b/y, 'text-[#82aaff]'], // 内建
  [/\b\d+(?:\.\d+)?\b/y, 'text-[#ffcb6b]'], // 数字
  [/[A-Za-z_]\w*(?=\()/y, 'text-[#62f1d1]'], // 函数名
]
const PY_PLAIN = /^(?:[A-Za-z_]\w*|[^A-Za-z_0-9"'#]+|[\s\S])/

function tokenizePython(code) {
  const out = []
  let i = 0
  while (i < code.length) {
    let tok = null
    for (const [re, cls] of PY_RULES) {
      re.lastIndex = i
      const m = re.exec(code)
      if (m && m.index === i) { tok = { t: m[0], cls }; break }
    }
    if (!tok) { const m = PY_PLAIN.exec(code.slice(i)); tok = { t: m[0], cls: 'text-white/85' } }
    out.push(tok)
    i += tok.t.length
  }
  return out
}

const ANTI_STALL_CODE = `def anti_stall(now_ms):
    """卡住自动加力度。返回 boost (0..STALL_K_MAX)，加到基准 throttle 上。
    判据：三轮 |RPM| 都 < STALL_ENC_RPM 且每过 STALL_MS 一个间隔 => +STALL_K_STEP，封顶 STALL_K_MAX。
    任一轮 |RPM|≥阈值=在动 => 回落 0。"""
    global _last_move_ms
    e = (abs(_cfg.enc_e1), abs(_cfg.enc_e4), abs(_cfg.enc_e2))
    if any(v >= _cfg.STALL_ENC_RPM for v in e):
        _last_move_ms = now_ms
        return 0.0
    if _last_move_ms is None:
        _last_move_ms = now_ms
        return 0.0
    steps = int((now_ms - _last_move_ms) // _cfg.STALL_MS)
    return min(_cfg.STALL_K_MAX, _cfg.STALL_K_STEP * steps)`

/* ---------- P5 四栏内容（滚轴 = 这四栏） ---------- */
const LINE_CARDS = [
  {
    title: '黑线判定',
    bullets: [
      '绿色线内做为 ROI，绿色线外画面不进入算法。',
      <>洋红色框选区域做为「种子域」，<br />与其连通的最大黑色区域识别为黑线。</>,
      '车轮、地砖缝隙、周围杂物、远处折回的黑线不干扰巡线。',
    ],
  },
  {
    title: 'Otsu 自适应二值化',
    bullets: [
      <>先算「种子域」对比度 <code className="text-accent">std</code>，过低认为没有黑线，进入丢线状态。</>,
      <>对比度达标则自动在黑白双灰度峰之间找到阈值 <code className="text-accent">Otsu thr</code>。</>,
      '算法不受光照变化和板子逐渐被踩黑影响。',
    ],
  },
  {
    title: '判断方向',
    bullets: [
      '车偏：用车前区域黑线重心，连续 P 控制，偏移大修正力度大。',
      '记忆：用 ROI 内黑线重心做为丢线后找线依据。',
    ],
  },
  {
    title: '自动油门',
    bullets: [
      '电机速度快，受帧率限制可能出线，速度慢可能在卡住',
      '引入油门控制量，电机转速持续为0时梯度提升油门',
    ],
  },
  /* 第 5 栏是**空栏占位**：最后一档（③④+代码）下面也得有一截"滚在下面"的东西，
     否则左边到那里就断了、和右边视频/代码不配平（用户要求"最后加个空栏"）。
     只需要 ≥ LINE_PEEK 这么高，露出来的部分被窗口下沿切掉。 */
  { title: '', bullets: [], placeholder: true },
]

/* ---------- P5 滚轴：每栏自适应高度，整条轨道按实测偏移上下平移 + 每栏按位置绕 X 轴倾斜 ---------- */
function LineRoller({ step }) {
  const itemRefs = useRef([])
  const [heights, setHeights] = useState(() => LINE_CARDS.map(() => LINE_FALLBACK_H))

  /* 量每栏真实高度（栏高由内容决定，不能写死），窗口尺寸和滚动位移都跟着它走 */
  useLayoutEffect(() => {
    const measure = () => {
      const hs = itemRefs.current.map((el, i) => (el ? el.offsetHeight : LINE_FALLBACK_H))
      setHeights((prev) => (prev.length === hs.length && prev.every((v, i) => v === hs[i]) ? prev : hs))
    }
    measure()
    const ro = new ResizeObserver(measure)
    itemRefs.current.forEach((el) => el && ro.observe(el))
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  const { off, view } = lineGeom(heights)
  const frameH = Math.max(...view) // 外框固定：行高不随档位变 → 右边的视频/代码一动不动
  const fade = 'linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 26px), transparent 100%)'
  return (
    <div style={{ height: frameH }}>
      <div
        className="relative overflow-hidden"
        style={{
          height: view[step], // 窗口只跟着自己的内容收放（贴顶），不再影响右边
          perspective: '1500px',
          maskImage: fade,
          WebkitMaskImage: fade,
          transition: 'height 720ms cubic-bezier(.22,.9,.24,1)',
        }}
      >
        <div
          className="flex flex-col"
          style={{
            gap: LINE_GAP,
            transform: `translateY(${-off[step]}px)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 720ms cubic-bezier(.22,.9,.24,1)',
          }}
        >
        {LINE_CARDS.map((c, i) => {
          const rel = i - step
          const off2 = rel < 0 || rel > 1 // 不在"正面两栏"里的，退到后面
          const angle = rel === 0 ? 6 : rel === 1 ? -6 : rel < 0 ? 24 : -24
          /* 紧跟着下面那一栏（露出半个身子、看得到标题）别压太暗，否则不像"真有一栏在下面" */
          const opacity = !off2 ? 1 : rel === 2 ? 0.72 : 0.4
          return (
            <div
              key={c.title}
              ref={(el) => { itemRefs.current[i] = el }}
              className="shrink-0"
              style={{
                transformOrigin: 'center center',
                transform: `translateZ(${off2 ? -70 : -8}px) rotateX(${angle}deg)`,
                opacity,
                transition: 'transform 720ms cubic-bezier(.22,.9,.24,1), opacity 720ms ease',
              }}
            >
              <Card title={c.title} className={c.placeholder ? 'min-h-[104px]' : ''}>
                {c.bullets.length > 0 && (
                  <ul className="space-y-2">
                    {c.bullets.map((b, k) => <Bullet key={k}>{b}</Bullet>)}
                  </ul>
                )}
              </Card>
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}

/* 旁边这一块：视频1 → 视频2 → 代码，三者**共用同一个 16:9 框 + 同一条说明**，
   换档时框的大小和位置完全不动（用户要求"右边视频和代码的大小位置固定不要动"） */
function LineStage({ step }) {
  const src = step === 1 ? lineRealVideo : lineVideo
  const poster = step === 1 ? posterLineReal : posterLine
  const caption =
    step === 2 ? '自动油门 · anti_stall 防卡死实现'
      : step === 1 ? '真机实录 · 第三人称全程（循环播放）'
        : '巡线 · 第一视角带标注画面（循环播放）'
  return (
    <figure className="relative z-20 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
      <div className="aspect-video w-full">
        {step === 2 ? (
          <pre className="flex h-full w-full items-center overflow-hidden px-4 font-mono text-[10px] leading-[1.6] whitespace-pre-wrap xl:text-[11px] xl:leading-[1.62]">
            <code>{tokenizePython(ANTI_STALL_CODE).map((t, i) => <span key={i} className={t.cls}>{t.t}</span>)}</code>
          </pre>
        ) : (
          /* key=src：换视频时重挂，保证从头自动播放 */
          <video key={src} className="h-full w-full object-cover" src={src} poster={poster}
            loop muted autoPlay playsInline controls />
        )}
      </div>
      <figcaption className="px-4 py-2 text-center text-xs text-white/50">{caption}</figcaption>
    </figure>
  )
}

/* ---------- P5 创新③ 算法 · 巡线（三段式：滚轴转一栏 + 旁边换一次） ---------- */
function LinePage({ step = 0 }) {
  return (
    <div className="relative min-h-screen px-6 pt-12 pb-16 md:px-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow="创新③ · 算法" title="巡线 · 黑线判定 + 方向控制 + 自动油门" />
        {/* items-center：右栏与滚轴视觉居中（行高由滚轴固定外框决定，换档不变 → 位置仍然不动） */}
        <div className="grid items-center gap-5 lg:grid-cols-2">
          <LineRoller step={step} />
          <LineStage step={step} />
        </div>
      </div>
    </div>
  )
}

/* ---------- P6 创新③ 算法 · 避障 ---------- */
function AvoidPage() {
  return (
    <div className="relative min-h-screen px-6 pt-20 pb-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow="创新③ · 算法" title="避障 · 左移绕板 + 双反馈" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card title="关键问题">
              <ul className="space-y-3">
                <Bullet>WiFi 延迟随机，到板距离不容易硬编码。</Bullet>
                <Bullet>保证『退出左移时距离固定』，『直行定距』才能硬编码时长。</Bullet>
              </ul>
            </Card>
            <Card title="左移双反馈调节">
              <ul className="space-y-3">
                <Bullet>① 让『板/地分界线』保持水平。</Bullet>
                <Bullet>② 超声距离反馈：提前 <b className="text-white/90">5cm</b> 进入，<br />左移时调整到与板 ~<b className="text-white/90">10cm</b>。</Bullet>
              </ul>
            </Card>
          </div>
          <VideoPanel src={avoidVideo} poster={posterAvoid} caption="左移避障 · 第一视角带标注画面（循环播放）" />
        </div>
      </div>
    </div>
  )
}

/* ---------- P7 创新③ 算法 · 推球 ---------- */
function PushPage() {
  return (
    <div className="relative min-h-screen px-6 pt-20 pb-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow="创新③ · 算法" title="推球 · 找球 + 动态 HSV 调色" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card title="识别 · 红/绿球 + 蓝色洞口">
              <ul className="space-y-3">
                <Bullet>用 <b className="text-white/90">HSV</b> 而非 RGB（颜色/亮度分离，抗光照）。</Bullet>
                <Bullet>Hue 按环形算（0/180 相接）→ 红色跨边界也能框住。</Bullet>
                <Bullet>球过滤：圆度 / 面积 / 宽高比；洞口只看颜色面积。</Bullet>
              </ul>
            </Card>
            <Card title="动态 HSV（实时调色台）">
              <ul className="space-y-3">
                <Bullet>三槽（球1 / 球2 / 洞）各 6 滑块 → 拖动即时生效。</Bullet>
                <Bullet>R 还原默认，S 打印当前值 → 粘回 config 固化。</Bullet>
                <Bullet>状态机：搜索 → 靠近 → 对球 → 对洞 → 横移 → 击球。</Bullet>
              </ul>
            </Card>
          </div>
          <VideoPanel src={strikeVideo} poster={posterStrike} caption="击球 · 第一视角带标注画面（循环播放）" />
        </div>
      </div>
    </div>
  )
}

/* ---------- 最后一页右下角的小圆环：点它 = 把画面交给下一位同学的站点 ----------
   点下去：① warmNextSlide()（此刻才开始预热，对方页面才可能被加载）
          ② 屏幕压黑，同时立刻跳走（RING_EXIT_MS = 0）
   为什么"立刻跳"也不白屏：浏览器在新页面画出东西之前会一直显示**当前这页**，
   而当前这页此刻已经是全黑 —— 那几百毫秒的加载时间观众看到的就是黑场。
   想让"幕布落下"这个动作看得更清楚，把 RING_EXIT_MS 写成 ~250 即可。 */
const RING_EXIT_MS = 0

function NextRing() {
  const [phase, setPhase] = useState('idle') // idle → going
  const timer = useRef(null)

  const go = useCallback(() => {
    window.location.href = NEXT_SLIDE.url
  }, [])

  const onClick = useCallback(() => {
    if (phase !== 'idle') return
    warmNextSlide()
    setPhase('going')
    if (RING_EXIT_MS > 0) timer.current = window.setTimeout(go, RING_EXIT_MS)
    else go()
  }, [phase, go])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <>
      <button onClick={onClick} tabIndex={-1}
        title={`进入 ${NEXT_SLIDE.label}`} aria-label={`进入 ${NEXT_SLIDE.label}`}
        className="fixed bottom-4 right-4 z-30 h-[30px] w-[30px] opacity-50 transition-opacity duration-300 hover:opacity-100">
        <svg viewBox="0 0 24 24" className="h-full w-full -rotate-90">
          <circle cx="12" cy="12" r="9" fill="none" strokeWidth="2" className="stroke-white/35" />
          <circle cx="12" cy="12" r="9" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-accent"
            style={{
              strokeDasharray: 56.5,
              strokeDashoffset: phase === 'idle' ? 56.5 : 0,
              transition: 'stroke-dashoffset 200ms linear',
            }} />
        </svg>
      </button>

      {/* 黑幕：点过之后立刻全黑，盖住"浏览器加载新页面"的那几百毫秒 */}
      <div className="pointer-events-none fixed inset-0 z-40 bg-[#050607] transition-opacity duration-200"
        style={{ opacity: phase === 'idle' ? 0 : 1 }} />
    </>
  )
}

const pages = [CoverPage, TocPage, ProjPage, ArchPage, LinePage, AvoidPage, PushPage]

const LINE_PAGE = 4 // P5 在 pages 里的下标（滚轴页）

/* ---------- 主 App：翻页 ---------- */
export default function App() {
  const hashPage = useCallback(() => {
    const m = window.location.hash.match(/p(\d+)/)
    return m ? Math.min(pages.length - 1, Math.max(0, parseInt(m[1], 10) - 1)) : 0
  }, [])

  const [page, setPage] = useState(hashPage)
  const [lineStep, setLineStep] = useState(0) // P5 滚轴档位 0/1/2
  const pageRef = useRef(page)
  useEffect(() => { pageRef.current = page }, [page])

  const go = useCallback((n) => setPage(Math.min(pages.length - 1, Math.max(0, n))), [])

  /* 前进：P5 先把滚轴转到底，才翻到下一页 */
  const advance = useCallback(() => {
    if (page === LINE_PAGE && lineStep < LINE_STEPS - 1) { setLineStep(lineStep + 1); return }
    if (page === LINE_PAGE - 1) setLineStep(0) // 正向进 P5 → 从第一档开始
    setPage(Math.min(pages.length - 1, page + 1))
  }, [page, lineStep])

  /* 后退：与前进严格对称——先逐档倒着滚，再退页；从 P6 退回来停在最后一档 */
  const retreat = useCallback(() => {
    if (page === LINE_PAGE && lineStep > 0) { setLineStep(lineStep - 1); return }
    if (page === LINE_PAGE + 1) setLineStep(LINE_STEPS - 1)
    setPage(Math.max(0, page - 1))
  }, [page, lineStep])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advance() }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); retreat() }
      else if (e.key === 'Home') { setLineStep(0); setPage(0) }
      else if (e.key === 'End') setPage(pages.length - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, retreat])

  useEffect(() => {
    /* 只有"手输地址栏 #pN"才重置档位；自己写 hash 触发的事件用 pageRef 忽略掉 */
    const onHash = () => {
      const target = hashPage()
      if (target !== pageRef.current) { setLineStep(0); setPage(target) }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [hashPage])
  useEffect(() => {
    window.location.hash = `p${page + 1}`
    window.scrollTo(0, 0)
  }, [page])

  const Active = pages[page]

  return (
    <div className="deck-shell text-white">
      <div key={page} className="page-enter min-h-screen">
        <Active go={go} step={page === LINE_PAGE ? lineStep : 0} />
      </div>

      {/* 左右半边点击翻页（无提示；视频面板 z-20 在点击层之上，控件仍可点） */}
      <button onClick={retreat} aria-label="上一页"
        className="fixed left-0 top-0 z-10 h-full w-1/2 cursor-pointer" tabIndex={-1} />
      <button onClick={advance} aria-label="下一页"
        className="fixed right-0 top-0 z-10 h-full w-1/2 cursor-pointer" tabIndex={-1} />

      {/* 最后一页才出现：右下角小圆环（点它把画面交给下一位同学的站点） */}
      {page === pages.length - 1 && <NextRing />}

      {/* 左下角：按键翻页提示 */}
      <div className="fixed bottom-4 left-4 z-30 text-xs text-white/35">← → 翻页 · 空格下一页 · Home/End 首末</div>
    </div>
  )
}
