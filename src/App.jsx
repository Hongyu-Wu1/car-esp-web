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
  url: 'https://typermonkie.github.io/', // ← 同学指定的地址（不带 #top：他不希望被加片段）
  label: 'typermonkie.github.io',        // 鼠标悬停提示里显示
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
                <Bullet>MJPEG esp 解压：帧率 <b className="text-white/90">7.8fps</b>。</Bullet>
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

/* 由四栏实测高度算出：每栏的轨道 y 偏移 off[]、每档的窗口高 view[]
   peek = "下一栏露出来的高度"，默认用 P5 的 LINE_PEEK；P7 传自己的（见 PUSH_PEEK） */
function lineGeom(heights, peek = LINE_PEEK) {
  const off = []
  let acc = 0
  for (const h of heights) { off.push(acc); acc += h + LINE_GAP }
  const view = heights.map((h, s) => {
    const pair = s + 1 < heights.length ? h + LINE_GAP + heights[s + 1] : h
    /* 判据是"当前两栏下面还有没有栏"，而不是档位是不是最后一档：
       末尾那栏空栏占位就是靠这个才会在最后一档露出来 */
    const hasNext = s + 2 < heights.length
    return pair + (hasNext ? LINE_GAP + peek : 0)
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
    /* pt-12/pb-16 与 P5 一致：不然整页比视口高 3px → 出现滚动条 → 内容被挤左 7px */
    <div className="relative min-h-screen px-6 pt-12 pb-16 md:px-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow="创新③ · 算法" title="避障 · 左移绕板 + 双反馈" />
        {/* items-start + 视频固定下移 72px：让 P6 的视频顶边与 P5 **完全同高**
            （72 = P5 里视频垂直居中后的上方留白 (495-351)/2；用居中会随左栏高度浮动，所以写死） */}
        <div className="grid items-start gap-5 lg:grid-cols-2">
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
                <Bullet>② 超声距离反馈：提前 <b className="text-white/90">5cm</b> 进入，左移时调整到与板 ~<b className="text-white/90">10cm</b>。</Bullet>
              </ul>
            </Card>
            <Card title="分界线检测">
              <ul className="space-y-3">
                <Bullet>Canny 双阈值 <b className="text-white/90">40/120</b> 提边缘 → 概率霍夫拟合直线段。</Bullet>
                <Bullet>只收 |倾角| &lt; <b className="text-white/90">30°</b> 的近水平线：顺带排除竖直的黑线与杂物边。</Bullet>
                <Bullet>角度按线段长度加权平均（长线话语权大，抗单条杂物线干扰）。</Bullet>
              </ul>
            </Card>
          </div>
          <div className="mt-[72px]">
            <VideoPanel src={avoidVideo} poster={posterAvoid} caption="左移避障 · 第一视角带标注画面（循环播放）" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- P7 创新③ 算法 · 推球（滚轴 + 视频/代码 · 与 P5 同一套几何） ---------- */
/* 左侧四栏（+ 空栏占位）：文案来自 `src/assets/推球(1).docx`，
   已按用户要求**去掉最前面的「## 逻辑架构」部分**（架构在第 4 页单独讲，docx 里那张三层架构图不用）。
   空栏占位的作用同 P5：最后一档下面也得有一截"滚在下面"的东西，否则左边到那里就断了。 */
const PUSH_CARDS = [
  {
    title: '识别 · 红/绿球 + 蓝色洞口',
    bullets: [
      <>用 HSV（色相 Hue / 饱和度 Saturation / 明度 Value）而非 BGR，实现颜色与亮度分离，减少光照改变对目标颜色的影响。</>,
      <>Hue 按环形计算（0 与 180 相接），跨边界的红色也能完整框住。</>,
      <>颜色判定只保留目标值邻域区间，增强小球 / 洞口识别的鲁棒性。</>,
      <>去噪用开运算（先腐蚀再膨胀），连通域算外接框与面积筛查。</>,
    ],
  },
  {
    title: '识别 · 创新点',
    bullets: [
      <>HSV 代替传统 BGR 算法。</>,
      <>色槽抽象：三个颜色在代码里只体现为 <code className="text-accent">SLOT_C1</code> / <code className="text-accent">SLOT_C2</code> / <code className="text-accent">SLOT_TGT</code>，加颜色只改这一处。</>,
      <>阈值实时注入：“在线标定”理念，便于随时调色。</>,
      <>图像可视化：用不同颜色标记目标球和洞口。</>,
    ],
  },
  {
    title: '推球入洞 · 主体逻辑',
    bullets: [
      <>巡线结束后由舵机接管，进入推球流程。</>,
      <>状态机思维：通过八个 FSM 控制小车行为状态。</>,
      <>
        三点一线：确保小球球心、洞口中心均处于小车中线邻域。
        <span className="mt-1 block space-y-0.5 text-[14px] leading-relaxed text-white/55 md:text-[15px]">
          <span className="block">· 设 <code className="text-accent">PUSH_BALL_CLOSE = 0.70</code> 防“假丢球”</span>
          <span className="block">· 预留 500ms 原地右转，执行下一个找球逻辑</span>
        </span>
      </>,
    ],
  },
  {
    title: '推球入洞 · 创新点',
    bullets: [
      <><code className="text-accent">config.py</code> 随时调节参数（如 <code className="text-accent">PUSH_BALL_CLOSE</code>、<code className="text-accent">PUSH_APPROACH_CENTER_X</code>）。</>,
      <>“循环性”对准（对球 ⇄ 看洞 ⇄ 横移）。</>,
      <>可视化：标注出电脑中线与 <code className="text-accent">PUSH_APPROACH_CENTER_X</code> 邻域，便于调试。</>,
    ],
  },
  { title: '', bullets: [], placeholder: true },
]

/* P7 滚轴"下一栏露出多少"比 P5 少（80 → 44）：右栏是"视频 + 代码"两块叠起来，整页本来就比 P5 高，
   少露一点才压得进 1366×768 的投影（P5 那边仍是 LINE_PEEK = 80，没动） */
const PUSH_PEEK = 44

/* P7 滚轴 = P5 的 LineRoller 换一套内容（同样的几何：栏高自适应 + 固定外框 + 3D 倾斜，
   所以"每档窗口高不同、外框不动"这条 P5 的性质在这里一样成立）。
   刻意**不动 P5 的 LineRoller**，避免影响已经定稿的 P5。 */
function PushRoller({ step }) {
  const itemRefs = useRef([])
  const [heights, setHeights] = useState(() => PUSH_CARDS.map(() => LINE_FALLBACK_H))

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

  const { off, view } = lineGeom(heights, PUSH_PEEK)
  const frameH = Math.max(...view) // 外框固定：右边的视频/代码一动不动
  const fade = 'linear-gradient(to bottom, transparent 0, #000 16px, #000 calc(100% - 26px), transparent 100%)'
  return (
    <div style={{ height: frameH }}>
      <div
        className="relative overflow-hidden"
        style={{
          height: view[step],
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
          {PUSH_CARDS.map((c, i) => {
            const rel = i - step
            const off2 = rel < 0 || rel > 1
            const angle = rel === 0 ? 6 : rel === 1 ? -6 : rel < 0 ? 24 : -24
            const opacity = !off2 ? 1 : rel === 2 ? 0.72 : 0.4
            return (
              <div
                key={c.title || `placeholder-${i}`}
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

/* ---------- P7 档2：八个 FSM 状态机（docx 竖版状态机图的横向重画） ---------- */
/* 为什么重画：docx 那张图是 709×1281 的竖图，塞进这一列（约 566 宽）只有 170 多 px 宽，字完全看不清。
   控制线按 docx 原图画全：**实线 = 判据满足继续往下走；虚线 = elif 分支 / 回边**（原地自转、球丢球歪、循环性对准）。
   坐标都在 566×542 的 viewBox 里，改一处要连着看相邻的线和标签。 */
const FSM_W = 168
const FSM_H = 48
const FSM_NODES = [
  { x: 56, y: 20, name: 'SEARCH 搜索球', sub: ['转 300ms / 停 350ms'] },
  { x: 56, y: 96, name: 'APPROACH 靠近球', sub: ['相对中容差 20%'] },
  { x: 56, y: 172, name: 'BALL_ALIGN 球对中', sub: ['容差 ±3%'] },
  { x: 56, y: 248, name: 'CHECK_HOLE 检查洞口', sub: ['★ 三点一线判据'], accent: true },
  { x: 322, y: 298, name: 'SHIFT 横移', sub: ['150ms 一小步'] },
  { x: 322, y: 384, name: 'SETTLE 等稳定', sub: ['200ms 停车'] },
  { x: 56, y: 384, name: 'STRIKE 击球', sub: ['油门 1.2 / 700ms', '★ 不看检测结果'] },
  { x: 56, y: 460, name: 'DONE 永久停车', sub: [], dashed: true },
]
/* [路径 d, 是否虚线] */
const FSM_EDGES = [
  ['M140 68 V96', false], // SEARCH → APPROACH
  ['M140 144 V172', false], // APPROACH → BALL_ALIGN
  ['M140 220 V248', false], // BALL_ALIGN → CHECK_HOLE
  ['M140 296 V384', false], // CHECK_HOLE → STRIKE：球洞都 ≤±3% 连续 3 帧（正常往下）
  ['M140 432 V460', false], // STRIKE → DONE：时间到
  ['M224 272 H273 V322 H322', false], // CHECK_HOLE elif：洞偏一侧（连续 2 帧确认）→ SHIFT
  ['M406 346 V384', false], // SHIFT → SETTLE：时间到
  ['M490 408 H534 V232 H180 V220', true], // SETTLE → 回 BALL_ALIGN：回到"重新对球"，形成循环
  ['M224 33 H500 V55 H224', true], // SEARCH elif：没看到 → 原地自转（交替节奏）
  ['M224 109 H500 V131 H224', true], // APPROACH elif：|x| > 20% → 原地自转
  ['M224 185 H500 V207 H224', true], // BALL_ALIGN elif：|x| > 3% → 自转
  ['M56 272 H22 V196 H56', true], // CHECK_HOLE elif：球丢 / 球歪 → 回 BALL_ALIGN
]
const FSM_LABELS = [
  { x: 150, y: 86, t: '看到球（立刻停车）' },
  { x: 150, y: 162, t: 'ball_y ≥ 0.70 连续 3 帧（球到画面下方 30%）' },
  { x: 132, y: 238, t: '连续 3 帧稳定', anchor: 'end' },
  { x: 150, y: 344, t: '球洞都 ≤ ±3% 连续 3 帧' },
  { x: 150, y: 448, t: '时间到' },
  { x: 230, y: 265, t: '洞偏一侧（连续 2 帧确认）' },
  { x: 414, y: 369, t: '时间到' },
  { x: 300, y: 225, t: '回到「重新对球」，形成循环' },
  { x: 232, y: 51, t: '没看到 → 原地自转（交替节奏）' },
  { x: 232, y: 127, t: '|x| > 20% → 原地自转' },
  { x: 232, y: 203, t: '|x| > 3% → 自转' },
  { x: 12, y: 234, t: '球丢 / 球歪', anchor: 'middle', rotate: true },
]

function PushFsm() {
  return (
    <svg viewBox="0 0 566 542" className="h-full w-full" role="img"
      aria-label="推球入洞状态机：SEARCH 到 DONE 八个 FSM，含 elif 分支与循环性对准">
      <defs>
        <marker id="fsmArrow" markerUnits="userSpaceOnUse" viewBox="0 0 9 9" refX="9" refY="4.5"
          markerWidth="9" markerHeight="9" orient="auto">
          <path d="M0 0 L9 4.5 L0 9 Z" fill="#62f1d1" />
        </marker>
        <marker id="fsmArrowDash" markerUnits="userSpaceOnUse" viewBox="0 0 9 9" refX="9" refY="4.5"
          markerWidth="9" markerHeight="9" orient="auto">
          <path d="M0 0 L9 4.5 L0 9 Z" fill="rgba(255,255,255,0.45)" />
        </marker>
      </defs>

      <text x="4" y="14" fontSize="11.5" fontWeight="600" fill="#62f1d1" letterSpacing="0.5">
        推球入洞 · 八个 FSM 状态机
      </text>
      <text x="562" y="14" fontSize="9.5" fill="rgba(255,255,255,0.45)" textAnchor="end">
        ★ = 关键判据
      </text>

      {/* 先画控制线，再画节点：箭头尖端落在节点边上，不会被线头压住 */}
      {FSM_EDGES.map(([d, dashed]) => (
        <path key={d} d={d} fill="none" strokeWidth="1.6"
          stroke={dashed ? 'rgba(255,255,255,0.42)' : '#62f1d1'}
          strokeDasharray={dashed ? '6 5' : undefined}
          markerEnd={`url(#${dashed ? 'fsmArrowDash' : 'fsmArrow'})`} />
      ))}

      {FSM_NODES.map((n) => (
        <g key={n.name}>
          <rect x={n.x} y={n.y} width={FSM_W} height={FSM_H} rx="9"
            fill="rgba(255,255,255,0.05)"
            stroke={n.accent ? 'rgba(98,241,209,0.55)' : 'rgba(255,255,255,0.16)'}
            strokeDasharray={n.dashed ? '5 4' : undefined} />
          <text x={n.x + FSM_W / 2} y={n.y + (n.sub.length ? 17 : 28)} textAnchor="middle"
            fontSize="11.5" fontWeight="600" fill="#62f1d1">{n.name}</text>
          {n.sub.map((s, i) => (
            <text key={s} x={n.x + FSM_W / 2} y={n.y + 31 + i * 12} textAnchor="middle"
              fontSize="9.5" fill="rgba(255,255,255,0.62)">{s}</text>
          ))}
        </g>
      ))}

      {FSM_LABELS.map((l) => (
        /* key 用坐标：标签里有两条都叫"时间到"（SHIFT→SETTLE、STRIKE→DONE），拿文字当 key 会撞 */
        <text key={`${l.x},${l.y}`} x={l.x} y={l.y} fontSize="10" fill="rgba(255,255,255,0.55)"
          textAnchor={l.anchor || 'start'}
          transform={l.rotate ? `rotate(-90 ${l.x} ${l.y})` : undefined}>{l.t}</text>
      ))}

      {/* 图例：两种线各是什么，投影时一眼能分清 */}
      <g fontSize="9.5" fill="rgba(255,255,255,0.45)">
        <line x1="130" y1="528" x2="158" y2="528" stroke="#62f1d1" strokeWidth="1.6" markerEnd="url(#fsmArrow)" />
        <text x="164" y="531">判据满足继续</text>
        <line x1="252" y1="528" x2="280" y2="528" stroke="rgba(255,255,255,0.42)" strokeWidth="1.6"
          strokeDasharray="6 5" markerEnd="url(#fsmArrowDash)" />
        <text x="286" y="531">elif 分支 / 回边（原地自转 · 跳回）</text>
      </g>
    </svg>
  )
}

/* 右侧：上 = 视频（固定不动，换档不重挂 → 一直循环播放），下 = 与档位对应的源码 / 状态机。
   两个框都用**定死的固定尺寸**（视频 aspect-video、代码框 PUSH_CODE_H），换档时框的位置和大小逐位不变（同 P5 那条性质）。 */
/* 两段源码是从 docx 里那两张代码截图抄下来的原文，用 **P5 同款**的 PY_RULES 高亮渲染成文字
   （比塞图片清楚：docx 图 1174px 宽缩到这一列只有 9~10px 的图内字号）。
   只有第 2 行的注释压成了 `# BGR -> HSV`：docx 里那截"（本项目 HSV 化的唯一入口）"会把整行挤到换行。 */
const HSV_MASK_CODE = `def hue_mask(bgr, thr):
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)          # BGR -> HSV
    h = hsv[:, :, 0].astype(np.int16)                   # 通道0 = H 色相（0..179）
    s = hsv[:, :, 1].astype(np.int16)                   # 通道1 = S 饱和度（0..255）
    v = hsv[:, :, 2].astype(np.int16)                   # 通道2 = V 明度（0..255）
    hue_hit = np.abs(_hue_ring_dist(h, int(thr['h_c']))) <= int(thr['h_tol'])
    s_hit = np.abs(s - int(thr['s_c'])) <= int(thr['s_tol'])
    v_hit = np.abs(v - int(thr['v_c'])) <= int(thr['v_tol'])
    return (hue_hit & s_hit & v_hit).astype(np.uint8) * 255`

const HUE_RING_CODE = `def _hue_ring_dist(h, center):
    return (h - center + 90) % 180 - 90          # 搬进 [-90, 90]`

const PUSH_CODE = [
  { code: HSV_MASK_CODE, caption: '识别源码 · hue_mask()：BGR→HSV（本项目 HSV 化的唯一入口）+ 环形 H + 邻域判定' },
  { code: HUE_RING_CODE, caption: '识别源码 · _hue_ring_dist()：色相按环形算距离，搬进 [-90, 90]' },
]

/* 代码框固定高：9 行的 hue_mask 放得下，2 行的 _hue_ring_dist 上下居中 → 换档时框不动 */
const PUSH_CODE_H = 160

function PushStage({ step }) {
  const fsm = step === 2
  const code = PUSH_CODE[fsm ? 0 : step] // 档2 只留位（invisible）撑住容器高度，用第 0 段即可
  return (
    <div className="relative">
      {/* 档 0/1：上视频 + 下代码。档 2 让位给状态机，但**留位**（invisible）→ 状态机框不跳 */}
      <div className={fsm ? 'invisible space-y-3' : 'space-y-3'} aria-hidden={fsm || undefined}>
        <figure className="relative z-20 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
          <video className="aspect-video w-full object-cover" src={strikeVideo} poster={posterStrike}
            loop muted autoPlay playsInline controls />
          <figcaption className="px-4 py-2 text-center text-xs text-white/50">找球 / 击球 · 第一视角带标注画面（循环播放）</figcaption>
        </figure>

        <figure className="relative z-20 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
          {/* whitespace-pre + overflow-x-auto：这几行代码比 P5 的长，宁可横向滚也不换行（换行会把固定框挤爆）。
              xl 用 10.5px 而不是 P5 的 11px：hue_mask 最长那行 76 字符，11px 实测 539px > 框内 532px 会出横向滚动条 */}
          <pre className="flex w-full items-center overflow-x-auto px-4 font-mono text-[10px] leading-[1.6] whitespace-pre xl:text-[10.5px] xl:leading-[1.62]"
            style={{ height: PUSH_CODE_H }}>
            <code>{tokenizePython(code.code).map((t, i) => <span key={i} className={t.cls}>{t.t}</span>)}</code>
          </pre>
          <figcaption className="px-4 py-2 text-center text-xs text-white/50">{code.caption}</figcaption>
        </figure>
      </div>

      {/* 档 2：不要视频了，右边整列都给状态机 */}
      {fsm && (
        <figure className="absolute inset-0 z-20 overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 shadow-2xl">
          <PushFsm />
        </figure>
      )}
    </div>
  )
}

/* ---------- P7 创新③ 算法 · 推球（三段式：滚轴转一栏 + 旁边换一次） ---------- */
function PushPage({ step = 0 }) {
  return (
    /* 为了压进 1366×768 的投影（整页实测 751px），这一页跟 P5/P6 有三处不同：
       ① 右栏**不再往下挪 72px**（P6 那个 mt-[72px] 是为了视频顶边对齐，这里放弃对齐换高度）；
       ② pb-16 → pb-4（纯底部留白，内容位置不变）；
       ③ 滚轮"下一栏"露出量 80 → PUSH_PEEK 44、代码框高 160。
       代价：P7 的视频顶边比 P5/P6 高 72px。 */
    <div className="relative min-h-screen px-6 pt-12 pb-4 md:px-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow="创新③ · 算法" title="推球 · 找球 + 动态 HSV 调色" />
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <PushRoller step={step} />
          <PushStage step={step} />
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
const PUSH_PAGE = 6 // P7 在 pages 里的下标（滚轴页：找球 + 推球入洞）
const PUSH_STEPS = PUSH_CARDS.length - 2 // 与 P5 同一个算法：每次露两栏 → 4 栏 + 空栏占位 = 3 档

/* ---------- 主 App：翻页 ---------- */
export default function App() {
  const hashPage = useCallback(() => {
    const m = window.location.hash.match(/p(\d+)/)
    return m ? Math.min(pages.length - 1, Math.max(0, parseInt(m[1], 10) - 1)) : 0
  }, [])

  const [page, setPage] = useState(hashPage)
  const [lineStep, setLineStep] = useState(0) // P5 滚轴档位 0/1/2
  const [pushStep, setPushStep] = useState(0) // P7 滚轴档位 0/1/2
  const pageRef = useRef(page)
  useEffect(() => { pageRef.current = page }, [page])

  const go = useCallback((n) => setPage(Math.min(pages.length - 1, Math.max(0, n))), [])

  /* 前进：滚轴页先把滚轴转到底，才翻到下一页（P5/P7 逻辑相同，各自独立计数） */
  const advance = useCallback(() => {
    if (page === LINE_PAGE && lineStep < LINE_STEPS - 1) { setLineStep(lineStep + 1); return }
    if (page === PUSH_PAGE && pushStep < PUSH_STEPS - 1) { setPushStep(pushStep + 1); return }
    if (page === LINE_PAGE - 1) setLineStep(0) // 正向进 P5 → 从第一档开始
    if (page === PUSH_PAGE - 1) setPushStep(0) // 正向进 P7 → 从第一档开始
    setPage(Math.min(pages.length - 1, page + 1))
  }, [page, lineStep, pushStep])

  /* 后退：与前进严格对称——先逐档倒着滚，再退页；从下一页退回来停在最后一档 */
  const retreat = useCallback(() => {
    if (page === LINE_PAGE && lineStep > 0) { setLineStep(lineStep - 1); return }
    if (page === PUSH_PAGE && pushStep > 0) { setPushStep(pushStep - 1); return }
    if (page === LINE_PAGE + 1) setLineStep(LINE_STEPS - 1)
    if (page === PUSH_PAGE + 1) setPushStep(PUSH_STEPS - 1)
    setPage(Math.max(0, page - 1))
  }, [page, lineStep, pushStep])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advance() }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); retreat() }
      else if (e.key === 'Home') { setLineStep(0); setPushStep(0); setPage(0) }
      else if (e.key === 'End') setPage(pages.length - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, retreat])

  useEffect(() => {
    /* 只有"手输地址栏 #pN"才重置档位；自己写 hash 触发的事件用 pageRef 忽略掉 */
    const onHash = () => {
      const target = hashPage()
      if (target !== pageRef.current) { setLineStep(0); setPushStep(0); setPage(target) }
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
        <Active go={go} step={page === LINE_PAGE ? lineStep : page === PUSH_PAGE ? pushStep : 0} />
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
