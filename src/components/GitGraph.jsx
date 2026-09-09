// Git 历史分支图：
//  中间一条横线 = main（长期主线）
//  分支按"距 line 的距离"分层，越远越"往外走"：
//    绿色(最近的主线) = 已并入 main；黄色(稍高) = 创新任务；红色(最高) = 断头/被放弃
export default function GitGraph() {
  const mid = 190
  const mainStart = 50
  const mainEnd = 950

  // 颜色：绿色=已并入 main；黄色=创新任务；玫红=断头/被放弃
  // depth：green 52（离 main 最近）、yellow 88（高一点）、red 122（再高一些）
  const arms = [
    // 上方一排（上臂）
    { x: 110, dir: -1, depth: 52, x2: 190, merge: true,  label: 'line-follow',           kind: 'merge' },
    { x: 260, dir: -1, depth: 60, x2: 420, merge: true,  label: 'camera-line',           kind: 'merge' },
    { x: 500, dir: -1, depth: 52, x2: 575, merge: true,  label: 'weekone',               kind: 'merge' },
    { x: 630, dir: -1, depth: 62, x2: 800, merge: true,  label: 'kick-ball',             kind: 'merge' },
    { x: 850, dir: -1, depth: 88, x2: 925, merge: true,  label: 'codex',                 kind: 'task' },
    // 下方一排（下臂）
    { x: 130, dir: 1,  depth: 52, x2: 200, merge: true,  label: 'pin-table',             kind: 'merge' },
    { x: 320, dir: 1,  depth: 52, x2: 395, merge: true,  label: 'simple',                kind: 'merge' },
    { x: 480, dir: 1,  depth: 88, x2: 555, merge: true,  label: 'gesture',               kind: 'task' },
    { x: 660, dir: 1,  depth: 122, x2: 730, merge: false, label: 'grid ✕',               kind: 'dead' },
    { x: 860, dir: 1,  depth: 122, x2: 930, merge: false, label: 'weektwo ✕',            kind: 'dead' },
  ]

  const color = (kind) =>
    kind === 'dead' ? '#fb7185' : kind === 'task' ? '#ffd166' : '#34d399'

  return (
    <svg viewBox="0 0 1000 350" className="w-full h-auto select-none" role="img"
      aria-label="git 分支历史：中间为 main 主线，上下为过程分支，成环=已并入 main，断头=被放弃">
      {/* main 主线 */}
      <line x1={mainStart} y1={mid} x2={mainEnd} y2={mid} stroke="#aab4c0" strokeWidth={4} strokeLinecap="round" />
      {/* 起点 + HEAD */}
      <circle cx={mainStart} cy={mid} r={6} fill="#0b0e12" stroke="#aab4c0" strokeWidth={2} />
      <circle cx={mainEnd} cy={mid} r={7} fill="#0b0e12" stroke="#f4f7f8" strokeWidth={2} />
      <text x={mainStart - 8} y={mid - 13} fill="#f4f7f8" fontSize={13} fontWeight={600}>main</text>
      <text x={mainEnd - 12} y={mid - 13} fill="#f4f7f8" fontSize={13} textAnchor="end" fontWeight={600}>HEAD → 现在</text>

      {arms.map((a) => {
        const c = color(a.kind)
        const travelY = mid + a.dir * a.depth
        const path = a.merge
          ? `M ${a.x} ${mid} L ${a.x} ${travelY} L ${a.x2} ${travelY} L ${a.x2} ${mid}`
          : `M ${a.x} ${mid} L ${a.x} ${travelY} L ${a.x2} ${travelY}`
        const labelX = a.merge ? (a.x + a.x2) / 2 : a.x2
        const labelY = a.dir === -1 ? travelY - 10 : travelY + 17
        const anchor = a.merge ? 'middle' : 'end'
        return (
          <g key={a.label}>
            {/* 分支点(在 main 上) */}
            <circle cx={a.x} cy={mid} r={4} fill="#0b0e12" stroke={c} strokeWidth={2} />
            <path d={path} fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            {/* 断头终止点 */}
            {!a.merge && <circle cx={a.x2} cy={travelY} r={5} fill={c} />}
            <text x={labelX} y={labelY} fill={c} fontSize={12.5} textAnchor={anchor} fontWeight={500}>
              {a.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
