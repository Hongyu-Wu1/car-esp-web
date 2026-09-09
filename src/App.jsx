import { useState, useEffect, useCallback } from 'react'
import GradientText from './components/GradientText'
import ShinyText from './components/ShinyText'
import carImg from './assets/car.png'

/* ---------- 页面1：封面 ---------- */
function CoverPage({ go }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative">
      <div className="absolute top-6 left-8 text-sm tracking-[0.25em] text-white/50">
        三轮车 · 摄像头智能小车
      </div>

      <div className="max-w-4xl">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60 mb-4">
          第 16 组 · 电子系统设计
        </p>

        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
          <GradientText colors={['#ffaa40', '#9c40ff', '#ffaa40']}>
            三轮车 —— 摄像头智能小车
          </GradientText>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-white/85">
          <ShinyText text="视觉 + 离载架构 · 循迹 / 避障 / 停车 / 自动双球入洞" speed={4} />
        </p>

        <div className="mt-8 flex justify-center">
          <img src={carImg} alt="小车"
            className="w-52 md:w-72 rounded-2xl shadow-2xl border border-white/15" />
        </div>

        <p className="mt-6 text-white/75 text-base md:text-lg">沙也涵 · 王翊泽 · 吴泓谕</p>

        <button onClick={() => go(1)}
          className="mt-8 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition text-white/85">
          下一页 · 目录 →
        </button>
      </div>
    </div>
  )
}

/* ---------- 页面2：目录 ---------- */
const toc = [
  { n: '①', title: '项目管理', desc: 'Git & GitHub 分支 / 提交管理，远端备份', color: 'from-amber-400/20 to-orange-500/10', border: 'border-amber-400/30' },
  { n: '②', title: '架构', desc: 'ESP 采集执行 + 笔记本计算 & 实时显示，C / py 分层', color: 'from-sky-400/20 to-blue-500/10', border: 'border-sky-400/30' },
  { n: '③', title: '算法', desc: '巡线 / 避障 / 推球 —— 自适应阈值 + 多反馈 + 动态 HSV', color: 'from-fuchsia-400/20 to-purple-500/10', border: 'border-fuchsia-400/30' },
]

function TocPage({ go }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <p className="text-sm uppercase tracking-[0.3em] text-white/55 mb-3">CONTENTS</p>
      <h2 className="text-3xl md:text-5xl font-bold mb-2">
        <GradientText colors={['#7fd6ff', '#c7a6ff', '#7fd6ff']}>目录 · 三个创新点</GradientText>
      </h2>
      <p className="text-white/50 mb-10">按 ← → 或点击下方卡片切换</p>

      <div className="grid gap-4 md:grid-cols-3 w-full max-w-5xl">
        {toc.map((t, i) => (
          <button key={t.n} onClick={() => go(i + 2)}
            className={`group rounded-2xl p-6 text-left bg-gradient-to-br ${t.color} border ${t.border} hover:-translate-y-1 transition`}>
            <div className="text-3xl font-bold text-white/90 mb-3">{t.n}</div>
            <div className="text-xl font-semibold text-white mb-2">{t.title}</div>
            <div className="text-sm text-white/70 leading-relaxed">{t.desc}</div>
          </button>
        ))}
      </div>

      <div className="mt-10 flex gap-6 text-white/70">
        <button onClick={() => go(0)} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15">‹ 返回封面</button>
      </div>
    </div>
  )
}

const pages = [CoverPage, TocPage]

/* ---------- 主 App：翻页逻辑 ---------- */
export default function App() {
  const hashPage = useCallback(() => {
    const m = window.location.hash.match(/p(\d+)/)
    return m ? Math.min(pages.length - 1, Math.max(0, parseInt(m[1], 10) - 1)) : 0
  }, [])

  const [page, setPage] = useState(hashPage)
  const go = useCallback((n) => setPage(Math.min(pages.length - 1, Math.max(0, n))), [])

  // 键盘翻页
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

  // 同步 hash（支持 #p1/#p2 定位 + 浏览器前进后退）
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
    <div className="relative min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 text-white overflow-hidden">
      {/* 当前页，key 触发淡入过渡 */}
      <div key={page} className="page-enter min-h-screen">
        <Active go={go} />
      </div>

      {/* 底部翻页控件 */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
        <button onClick={() => go(page - 1)} disabled={page === 0}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 disabled:opacity-30 transition text-white/85">‹ 上一页</button>

        <div className="flex gap-2">
          {pages.map((_, i) => (
            <button key={i} onClick={() => go(i)} aria-label={`第${i + 1}页`}
              className={`w-3 h-3 rounded-full transition ${i === page ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'}`} />
          ))}
        </div>

        <button onClick={() => go(page + 1)} disabled={page === pages.length - 1}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 disabled:opacity-30 transition text-white/85">下一页 ›</button>
      </div>

      <div className="absolute bottom-3 right-4 text-white/40 text-xs">{page + 1} / {pages.length}</div>
      <div className="absolute bottom-3 left-4 text-white/35 text-xs">← → 翻页 · 空格下一页</div>
    </div>
  )
}
