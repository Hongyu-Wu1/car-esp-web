// Git 历史"仙人掌"图：
//  中间一条横线 = main（长期主线）
//  上下长出分支像仙人掌手臂：完整手臂=分出去又合回 main（成环）；断头=被放弃/删除（终点圆点）
export default function GitGraph() {
  const mid = 210
  const mainStart = 50
  const mainEnd = 950

  const arms = [
    { x: 170, dir: -1, depth: 95,  x2: 240, merge: false, label: 'feat/line-follow',       kind: 'dead' },
    { x: 210, dir: 1,  depth: 100, x2: 285, merge: false, label: 'grid ✕ 作废',           kind: 'dead' },
    { x: 320, dir: -1, depth: 110, x2: 470, merge: true,  label: 'feat-camera-line-follow', kind: 'merge' },
    { x: 440, dir: 1,  depth: 85,  x2: 540, merge: true,  label: 'simple-version',        kind: 'merge' },
    { x: 575, dir: -1, depth: 150, x2: 815, merge: true,  label: 'feat-follow-line-and-kick-ball', kind: 'current' },
    { x: 690, dir: 1,  depth: 80,  x2: 760, merge: true,  label: 'tested/car-esp-newest', kind: 'merge' },
    { x: 858, dir: -1, depth: 105, x2: 922, merge: false, label: 'weektwo ✕ 已删',        kind: 'dead' },
  ]

  const color = (kind) =>
    kind === 'dead' ? '#fb7185' : kind === 'current' ? '#ffd166' : '#62f1d1'

  return (
    <svg viewBox="0 0 1000 420" className="w-full h-auto select-none" role="img"
      aria-label="git 分支历史：中间为 main 主线，上下为过程分支，成环=已合回，断头=被放弃">
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
