import { useState, useEffect, useCallback } from 'react'
import Particles from './components/Particles'
import GitGraph from './components/GitGraph'
import carImg from './assets/car.png'
import lineVideo from './assets/demo_line.mp4'
import avoidVideo from './assets/demo_avoid.mp4'
import strikeVideo from './assets/demo_strike.mp4'
import posterLine from './assets/poster_demo_line.png'
import posterAvoid from './assets/poster_demo_avoid.png'
import posterStrike from './assets/poster_demo_strike.png'

/* ---------- 通用小部件 ---------- */
function PageHeader({ eyebrow, title }) {
  return (
    <header className="mb-8">
      <p className="eyebrow left"><span />{eyebrow}</p>
      <h2 className="content-title mt-4">{title}</h2>
    </header>
  )
}

function Bullet({ children }) {
  return (
    <li className="flex gap-3">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_10px_#62f1d1]" />
      <span className="text-white/80 text-sm md:text-[15px] leading-relaxed">{children}</span>
    </li>
  )
}

function Card({ title, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6 backdrop-blur ${className}`}>
      {title && <h3 className="mb-4 text-sm font-semibold tracking-[0.18em] text-accent">{title}</h3>}
      {children}
    </div>
  )
}

function VideoPanel({ src, poster, caption }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
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
]

function TocPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16 pb-24">
      <p className="eyebrow"><span />CONTENTS</p>
      <h2 className="content-title mt-4">目录</h2>

      <div className="mt-10 grid w-full max-w-5xl gap-4 md:grid-cols-3">
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
    <div className="relative min-h-screen px-6 pt-20 pb-24 md:px-10">
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

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card title="遇到的主要问题">
            <ul className="space-y-3">
              <Bullet>反复烧录 / 串口不好读 → <b className="text-white/90">改算法不用烧固件</b>，报错一眼看到。</Bullet>
              <Bullet>夜晚没真机也能调试 → 录播 + test&sim 仿真验证再上机。</Bullet>
            </ul>
          </Card>
          <Card title="最后一个提交 · 文件关系树">
            <pre className="overflow-x-auto whitespace-pre font-mono text-[.72rem] leading-relaxed text-white/75">
{`main/   (C 固件)
  app/     remote_b.c · main.c
  comm/    wifi_link.c
  motion/  motor_driver.c · servo.c
  sensing/ camera.c · ultrasonic.c · wheel_encoder.c
  display/ dashboard.c · tft.c

py/     (笔记本 · 算法)
  main.py            编排 / IO
  wifi_link.py       网络(收包/重连/发送)
  perception.py      帧 → 观测
  task_controller.py 协调(FOLLOW→RAISE→PUSH)
  record.py          展示 / 录像 / CSV
  actions.py · vision.py · mode*.py
  config.py · ball_vision.py · color_tune.py`}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ---------- P5 创新③ 算法 · 巡线 ---------- */
function LinePage() {
  return (
    <div className="relative min-h-screen px-6 pt-20 pb-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow="创新③ · 算法" title="巡线 · 种子连通域 + Otsu 自适应阈值" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card title="黑色线判定 · Otsu 自适应二值化">
              <ul className="space-y-3">
                <Bullet>阈值用『种子框』(车底窄带) 算，抗光照。</Bullet>
                <Bullet>种子框对比度低 → 判丢线，不进 Otsu。</Bullet>
              </ul>
            </Card>
            <Card title="判向 · 种子连通域质心">
              <ul className="space-y-3">
                <Bullet>与种子框连通的线块 → 质心偏置。</Bullet>
                <Bullet><code className="text-accent">offset</code> 位置误差 → 连续 P 控制；<code className="text-accent">bias</code> 整块质心 → 方向记忆(丢线按记忆转)。</Bullet>
              </ul>
            </Card>
            <Card title="关键问题">
              <Bullet>光照 / 地面干净程度不固定 → Otsu 自适应(不用固定阈值) + 对比度兜底。</Bullet>
            </Card>
          </div>
          <VideoPanel src={lineVideo} poster={posterLine} caption="巡线 · 第一视角带标注画面（循环播放）" />
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
            <Card title="流程">
              <Bullet>左移绕板 → 直行定距 → 右移找线回线；板 = 障碍，绕行而非停。</Bullet>
            </Card>
            <Card title="双反馈调节（左移时闭环）">
              <ul className="space-y-3">
                <Bullet>① 让『板/地分界线』保持水平（倾角当误差）。</Bullet>
                <Bullet>② 超声距离反馈：维持与板 ~10cm（太近后退 / 太远前进）。</Bullet>
              </ul>
            </Card>
            <Card title="关键问题">
              <Bullet>每次 WiFi 延迟不定，到板距离不好测 → 保证『退出左移时距离固定』 → 后面『直行定距』才能硬编码时长。</Bullet>
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

/* ---------- P8 总结 ---------- */
const gains = [
  '嵌入式 × CV × 控制的完整闭环',
  '架构分层：感知 / 控制 / 状态机 / 编排 各司其职',
  '用 git 管理多人在线协作 + 远端备份',
  '真机踩坑 → 定位 → 修复（油门狂飙 / 舵机线松 / 掉线）',
  '仿真 / 录播先验证，再上真机',
]

function SummaryPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16 pb-24 text-center">
      <p className="eyebrow"><span />SUMMARY · Q&amp;A</p>
      <h2 className="content-title mt-4">收获</h2>

      <div className="mt-8 w-full max-w-3xl">
        <Card title="主要收获">
          <ul className="space-y-2.5">
            {gains.map((g) => <Bullet key={g}>{g}</Bullet>)}
          </ul>
        </Card>
      </div>

      <p className="mt-8 max-w-3xl text-lg md:text-xl font-light leading-relaxed text-white/85">
        『算法全部离载到笔记本，改逻辑不用烧固件；摄像头视觉 + 多状态机，
        从循迹一路做到<GradientTextWrapper>自动双球入洞</GradientTextWrapper>。』
      </p>

      <p className="muted mt-8 text-xs tracking-[.2em]">谢谢 · 欢迎提问</p>
      <p className="mt-2 text-xs text-white/60">第 16 组 · 沙也涵 / 王翊泽 / 吴泓谕</p>
    </div>
  )
}

function GradientTextWrapper({ children }) {
  return <span className="text-accent">{children}</span>
}

const pages = [CoverPage, TocPage, ProjPage, ArchPage, LinePage, AvoidPage, PushPage, SummaryPage]

/* ---------- 主 App：翻页 ---------- */
export default function App() {
  const hashPage = useCallback(() => {
    const m = window.location.hash.match(/p(\d+)/)
    return m ? Math.min(pages.length - 1, Math.max(0, parseInt(m[1], 10) - 1)) : 0
  }, [])

  const [page, setPage] = useState(hashPage)
  const go = useCallback((n) => setPage(Math.min(pages.length - 1, Math.max(0, n))), [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setPage(p => Math.min(pages.length - 1, p + 1)) }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); setPage(p => Math.max(0, p - 1)) }
      else if (e.key === 'Home') setPage(0)
      else if (e.key === 'End') setPage(pages.length - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onHash = () => setPage(hashPage())
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
        <Active go={go} />
      </div>

      {/* 左下角：按键翻页提示 */}
      <div className="fixed bottom-4 left-4 z-20 text-xs text-white/35">← → 翻页 · 空格下一页 · Home/End 首末</div>
    </div>
  )
}
