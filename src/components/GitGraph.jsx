// Git 分支历史图（横轴 = 工作日；周末不占长度；同日多事件按 时:分 排先后）
//  main 为主线；每个"分出来/并入/尖端"事件各自一根竖线；只在该日期的第一根树线下方标日期
//  颜色：绿=已并入 main；绿色虚线=部分吸收；黄=创新任务；红=断头/被放弃
//  高度：绿离 main 最近，黄次之，红最远
//
//  动画（切到本页播放，共 10s，播完定住）：
//    用一个随时间向右移动的裁剪窗口揭示全部线条 —— 窗口右沿 = main 的当前末端，
//    所以分支线和 main 同步延伸、绝不会超过 main；分支名在"长到自身一半"时才出现。
//
//  2026-08-25 是周二 → 周末 = 08-29(六)/08-30(日)、09-05(六)/09-06(日)，不占长度
//  工作日序号：08-25=0 08-26=1 08-27=2 08-28=3 08-31=4 09-01=5 09-02=6 09-03=7 09-04=8 09-07=9 09-08=10 09-09=11
export default function GitGraph() {
  const WD = { '08-25': 0, '08-26': 1, '08-27': 2, '08-28': 3, '08-31': 4, '09-01': 5, '09-02': 6, '09-03': 7, '09-04': 8, '09-07': 9, '09-08': 10, '09-09': 11 }
  const X0 = 60
  const K = 76            // 每个工作日多少 px
  const MIN_GAP = 10      // 同日事件最小间距
  const mid = 78
  const H = 184           // viewBox 高
  const DURATION = 10     // 动画总时长(s)
  const PAD = 12          // 揭示窗口两端余量（保证起点/HEAD 圆圈完整）
  const DATE_DX = 24      // 日期标签整体左移 3.5 个字母

  const mins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const rawX = (d, t) => X0 + (WD[d] + mins(t) / 1440) * K

  const GREEN = '#34d399'
  const YELLOW = '#ffd166'
  const RED = '#fb7185'

  const D_GREEN = 36
  const D_GREEN_FAR = 58   // color-tune 再往上一点
  const D_YELLOW = 54
  const D_RED = 78

  const events = [
    { id: 'lf_fork', d: '08-25', t: '07:05' },
    { id: 'nw_fork', d: '08-25', t: '09:21' },
    { id: 'sv_fork', d: '08-27', t: '08:33' },
    { id: 'nw_tip', d: '08-31', t: '02:08' },
    { id: 'cam_fork', d: '08-31', t: '03:33' },
    { id: 'wk_merge', d: '08-31', t: '08:12' },
    { id: 'seed_fork', d: '09-02', t: '07:38' },
    { id: 'ct_fork', d: '09-03', t: '11:48' },
    { id: 'host_fork', d: '09-04', t: '02:34' },
    { id: 'seed_tip', d: '09-04', t: '02:38' },
    { id: 'host_tip', d: '09-04', t: '08:32' },
    { id: 'cam_merge', d: '09-07', t: '06:40' },
    { id: 'ct_merge', d: '09-07', t: '07:23' },
    { id: 'kb_fork', d: '09-07', t: '08:00' },
    { id: 'codex_fork', d: '09-08', t: '03:55' },
    { id: 'codex_tip', d: '09-08', t: '08:32' },
    { id: 'kb_merge', d: '09-08', t: '08:32' },
    { id: 'gest_fork', d: '09-08', t: '08:32' },
    { id: 'gest_tip', d: '09-09', t: '08:04' },
  ]

  const XMAP = {}
  {
    let prev = -1e9
    ;[...events].sort((a, b) => rawX(a.d, a.t) - rawX(b.d, b.t)).forEach((e) => {
      const x = Math.max(rawX(e.d, e.t), prev + MIN_GAP)
      XMAP[e.id] = Math.round(x)
      prev = x
    })
  }
  const X = (id) => XMAP[id]
  const svTipX = Math.round(rawX('08-28', '06:33'))

  const firstByDate = {}
  events.forEach((e) => { if (!firstByDate[e.d] || e.t < firstByDate[e.d].t) firstByDate[e.d] = e })
  const dateLabels = Object.keys(firstByDate).map((d) => ({ d, x: X(firstByDate[d].id) }))

  const maxX = Math.max(...events.map((e) => X(e.id)))
  const span = maxX - X0
  const dOf = (x) => Math.max(0, Math.min(DURATION, ((x - X0) / span) * DURATION))
  const fade = (x, dur = 0.5) => ({ animation: `gitFade ${dur}s ease-out ${dOf(x)}s both` })

  const chainY = mid - D_GREEN
  const chain = [
    { label: 'feat/line-follow', x0: X('lf_fork'), x1: X('sv_fork'), dashed: true, who: 'HW' },
    { label: 'simple-version', x0: X('sv_fork'), x1: svTipX, dashed: true, who: 'HW' },
    { label: 'weekone', x0: svTipX, x1: X('wk_merge'), dashed: false, who: 'TM' },
  ]

  const arms = [
    { label: 'no-wifi-speed-feedback', side: 1, depth: D_RED, a: 'nw_fork', b: 'nw_tip', merge: false, color: RED, who: 'HW' },
    { label: 'feat-camera-line-follow', side: 1, depth: D_GREEN, a: 'cam_fork', b: 'cam_merge', merge: true, color: GREEN, dx: -7, who: 'HW' },
    { label: 'seed-camera-follow', side: -1, depth: D_GREEN, a: 'seed_fork', b: 'seed_tip', merge: true, color: GREEN, labelBelow: true, who: 'TM' },
    { label: 'color-tune-push-hsv', side: -1, depth: D_GREEN_FAR, a: 'ct_fork', b: 'ct_merge', merge: true, color: GREEN, who: 'PY' },
    { label: 'feat-follow-line-and-kick-ball', side: -1, depth: D_GREEN, a: 'kb_fork', b: 'kb_merge', merge: true, color: GREEN, anchor: 'end', dx: -7, who: 'HW' },
    { label: 'host', side: 1, depth: D_RED, a: 'host_fork', b: 'host_tip', merge: false, color: RED, who: 'TM' },
    { label: 'codex/ai-companion', side: 1, depth: D_YELLOW, a: 'codex_fork', b: 'codex_tip', merge: false, color: YELLOW, who: 'TM' },
    { label: 'feat/gesture-remote', side: -1, depth: D_YELLOW, a: 'gest_fork', b: 'gest_tip', merge: false, color: YELLOW, who: 'PY' },
  ]

  // 标签：在"分支线长到一半"时出现 → 即 main 走到该分支中点时
  const labels = []
  chain.forEach((s, i) => labels.push({ text: s.label, who: s.who, x: (s.x0 + s.x1) / 2, y: i === 1 ? chainY + 15 : chainY - 8, anchor: 'middle', color: GREEN, size: 12, at: (s.x0 + s.x1) / 2 }))
  arms.forEach((a) => {
    const y = mid + a.side * a.depth
    const labelY = a.labelBelow ? y + 15 : (a.side === -1 ? y - 9 : y + 17)
    const anchor = a.anchor || 'middle'
    const ax = X(a.a); const bx = X(a.b)
    const lx = (anchor === 'end' ? bx : (ax + bx) / 2) + (a.dx || 0)
    labels.push({ text: a.label, who: a.who, x: lx, y: labelY, anchor, color: a.color, size: 12, at: (ax + bx) / 2 })
  })
  dateLabels.forEach((d) => labels.push({ text: d.d, x: d.x - DATE_DX, y: mid + 15, anchor: 'middle', color: '#8b98a5', size: 10.5, at: d.x }))

  // 文字宽度估算（含白色创建者后缀），用于定位与遮罩
  const cw = (size) => size * 0.56
  const box = (l) => {
    const chars = l.text.length + (l.who ? l.who.length : 0)
    const w = chars * cw(l.size)
    const x0 = l.anchor === 'end' ? l.x - w : l.anchor === 'start' ? l.x : l.x - w / 2
    return { x0, w, y0: l.y - l.size * 0.9, h: l.size * 1.15 }
  }

  return (
    <svg viewBox={`0 0 1000 ${H}`} className="w-full h-auto select-none" role="img"
      aria-label="git 分支历史（按工作日与时:分）：main 为主线；绿=已并入，绿虚线=部分吸收，黄=创新任务，红=断头">
      <defs>
        {/* 在标签处挖空，避免线压字 */}
        <mask id="gitLabelMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="1000" height={H}>
          <rect x="0" y="0" width="1000" height={H} fill="#fff" />
          {labels.map((l, i) => {
            const b = box(l)
            return <rect key={i} x={b.x0 - 5} y={b.y0} width={b.w + 10} height={b.h} fill="#000" />
          })}
        </mask>
        {/* 揭示窗口：右沿 ≈ main 当前末端，随时间向右移动；两端各留 PAD 让起点/HEAD 圆圈完整 */}
        <clipPath id="gitReveal" clipPathUnits="userSpaceOnUse">
          <rect x={X0 - PAD} y="0" width={span + PAD * 2} height={H}
            style={{ '--sweep': `${-(span + PAD * 2)}px`, animation: `gitSweep ${DURATION}s linear forwards` }} />
        </clipPath>
      </defs>

      <g mask="url(#gitLabelMask)" clipPath="url(#gitReveal)">
        {/* main */}
        <line x1={X0} y1={mid} x2={maxX} y2={mid} stroke="#aab4c0" strokeWidth={4} strokeLinecap="round" />
        <circle cx={X0} cy={mid} r={6} fill="#0b0e12" stroke="#aab4c0" strokeWidth={2} />
        <circle cx={maxX} cy={mid} r={7} fill="#0b0e12" stroke="#f4f7f8" strokeWidth={2} />

        {/* 每根树线在 main 上的节点 */}
        {events.map((e) => (
          <circle key={e.id} cx={X(e.id)} cy={mid} r={3.5} fill="#0b0e12" stroke="#aab4c0" strokeWidth={1.6} />
        ))}

        {/* 绿色链 */}
        <path d={`M ${X('lf_fork')} ${mid} L ${X('lf_fork')} ${chainY}`} fill="none" stroke={GREEN} strokeWidth={3} strokeLinecap="round" />
        <path d={`M ${X('sv_fork')} ${mid} L ${X('sv_fork')} ${chainY}`} fill="none" stroke={GREEN} strokeWidth={3} strokeLinecap="round" />
        <path d={`M ${X('wk_merge')} ${chainY} L ${X('wk_merge')} ${mid}`} fill="none" stroke={GREEN} strokeWidth={3} strokeLinecap="round" />
        {chain.map((s) => (
          <line key={s.label} x1={s.x0} y1={chainY} x2={s.x1} y2={chainY} stroke={GREEN} strokeWidth={3}
            strokeLinecap="round" strokeDasharray={s.dashed ? '7 5' : undefined} />
        ))}

        {/* 其它分支臂 */}
        {arms.map((a) => {
          const y = mid + a.side * a.depth
          const ax = X(a.a); const bx = X(a.b)
          return (
            <g key={a.label}>
              <path d={`M ${ax} ${mid} L ${ax} ${y}`} fill="none" stroke={a.color} strokeWidth={3} strokeLinecap="round" />
              <line x1={ax} y1={y} x2={bx} y2={y} stroke={a.color} strokeWidth={3} strokeLinecap="round" />
              {a.merge
                ? <path d={`M ${bx} ${y} L ${bx} ${mid}`} fill="none" stroke={a.color} strokeWidth={3} strokeLinecap="round" />
                : <circle cx={bx} cy={y} r={5} fill={a.color} />}
            </g>
          )
        })}
      </g>

      {/* 文字（最上层，各自在"分支长到一半"时出现） */}
      <text x={X0 - 10} y={mid - 12} fill="#f4f7f8" fontSize={13} fontWeight={600} textAnchor="end" style={fade(X0)}>main</text>
      <text x={maxX} y={mid - 14} fill="#f4f7f8" fontSize={12} fontWeight={600} textAnchor="middle" style={fade(maxX, 0.6)}>HEAD</text>
      {labels.map((l, i) => (
        <text key={i} x={l.x} y={l.y} fill={l.color} fontSize={l.size} fontWeight={500} textAnchor={l.anchor} style={fade(l.at)}>
          {l.text}{l.who ? <tspan fill="#ffffff">{l.who}</tspan> : null}
        </text>
      ))}
    </svg>
  )
}
