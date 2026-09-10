// P4 右侧：文件结构树形图（带名字）
//  main/（C 固件）：文件夹后直接列该目录的 .c 文件（不再分岔）；comm/ 放最后
//  py/（笔记本算法）：按调用层次展开 —— main.py → wifi_link / perception / task_controller / record → 它们调用的模块
//  另外：comm/（固件侧通信）与 py 的 wifi_link 之间拉一条弧线（无线链路），中点画一个小 wifi 标
//  所有连线用 mask 在文字处断开，保证"线不压字"
// 名称取自实际工程目录
export default function FileTree() {
  const C_FW = '#9b6cff'
  const C_PY = '#62f1d1'
  const C_LINK = '#ffd166'
  const DIM = '#8b98a5'

  const L1X = 130
  const FW_X = 200
  const L2X = 200
  const L3X = 350
  const L4X = 500
  const X_OF = { 2: L2X, 3: L3X, 4: L4X }

  const FW_C = 55
  const PY_C = 212
  const ROW = 16.5
  const R = (i) => Math.round(PY_C + (i - 4.5) * ROW)

  // comm/ 放在最后
  const fw = ['app/|main.c · remote_b.c', 'motion/|motor_driver.c · servo.c', 'sensing/|camera.c · ultrasonic.c · wheel_encoder.c · negative_feedback.c', 'display/|dashboard.c · tft.c · led_indicator.c', 'comm/|wifi_link.c']
    .map((s, i) => {
      const [name, files] = s.split('|')
      return { name, files, y: Math.round(FW_C + (i - 2) * ROW) }
    })

  const py = [
    { id: 'main', name: 'main.py', role: '编排 / IO', lv: 2, y: R(0) },
    { id: 'wifi', name: 'wifi_link.py', role: '网络', lv: 3, y: R(1), parent: 'main' },
    { id: 'perc', name: 'perception.py', role: '帧→观测', lv: 3, y: R(2), parent: 'main' },
    { id: 'vis', name: 'vision.py', lv: 4, y: R(3), parent: 'perc' },
    { id: 'ball', name: 'ball_vision.py', lv: 4, y: R(4), parent: 'perc' },
    { id: 'task', name: 'task_controller.py', role: '协调', lv: 3, y: R(5), parent: 'main' },
    { id: 'mode', name: 'mode*.py', lv: 4, y: R(6), parent: 'task' },
    { id: 'act', name: 'actions.py', lv: 4, y: R(7), parent: 'task' },
    { id: 'rec', name: 'record.py', role: '录像 / CSV', lv: 3, y: R(8), parent: 'main' },
    { id: 'cfg', name: 'config.py', role: '公共参数', lv: 2, y: R(9), parent: 'py' },
  ]
  const byId = Object.fromEntries(py.map((p) => [p.id, p]))

  const root = { x: 34, y: Math.round((FW_C + PY_C) / 2) }
  const elbow = (px, py2, cx, cy) => `M ${px} ${py2} H ${Math.round(px + (cx - px) / 2)} V ${cy} H ${cx}`
  // 父节点右侧有文字时：先上/下折一小段绕开文字，再向右
  const elbowD = (px, py2, cx, cy) => {
    const dy = cy > py2 ? 11 : -11
    const mx = Math.round(px + (cx - px) / 2)
    return `M ${px} ${py2} V ${py2 + dy} H ${mx} V ${cy} H ${cx}`
  }

  // 文字宽度估算（ASCII≈0.55em，中日韩≈1em）
  const estW = (s, size) => { let w = 0; for (const ch of s) w += /[\u2e80-\u9fff\uff00-\uffef]/.test(ch) ? size : size * 0.55; return w }

  // 无线链路：从 comm/ 行的「wifi_link.c」文字后面引出 → py 的 wifi_link 节点
  const commRow = fw[fw.length - 1]
  const sx = Math.round(FW_X + 14 + estW(commRow.name + '  ' + commRow.files, 11.5) + 7)
  const sy = commRow.y
  const ex = L3X
  const ey = byId.wifi.y
  const qx = ex + 20
  const qy = (sy + ey) / 2
  const arc = `M ${sx} ${sy} Q ${qx} ${qy} ${ex} ${ey}`
  const icon = { x: Math.round((sx + 2 * qx + ex) / 4), y: Math.round((sy + 2 * qy + ey) / 4) }

  // —— 文字盒子（用于 mask 断线） ——
  const boxes = []
  const addBox = (x, y, s, size, anchor = 'start') => {
    const w = estW(s, size)
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x
    boxes.push({ x: x0 - 3, y: y - size * 0.85, w: w + 6, h: size * 1.2 })
  }
  fw.forEach((f) => addBox(FW_X + 14, f.y + 4, f.name + '  ' + f.files, 11.5))
  py.forEach((p) => addBox(X_OF[p.lv] + 13, p.y + 4, p.name + (p.role ? '  ' + p.role : ''), 11.5))
  addBox(L1X - 14, FW_C - 14, 'main/ · C 固件', 12, 'middle')
  addBox(L1X - 21, PY_C - 14, 'py/ · 笔记本算法', 12, 'middle')
  addBox(root.x, root.y - 18, 'car-esp', 11.5, 'middle')
  boxes.push({ x: icon.x - 13, y: icon.y - 11, w: 26, h: 24 })   // wifi 标

  const WifiMark = ({ x, y, c }) => (
    <g stroke={c} fill="none" strokeWidth={1.7} strokeLinecap="round">
      <path d={`M ${x - 9} ${y + 2} A 9 9 0 0 1 ${x + 9} ${y + 2}`} />
      <path d={`M ${x - 5.5} ${y + 2} A 5.5 5.5 0 0 1 ${x + 5.5} ${y + 2}`} />
      <path d={`M ${x - 2.2} ${y + 2} A 2.2 2.2 0 0 1 ${x + 2.2} ${y + 2}`} />
      <circle cx={x} cy={y + 5.6} r={1.5} fill={c} stroke="none" />
    </g>
  )

  return (
    <svg viewBox="0 0 710 300" className="mx-auto h-auto w-full max-w-[820px] select-none" role="img"
      aria-label="文件结构树：main/ 固件（app、motion、sensing、display、comm 及其 .c 文件）与 py/ 算法（main.py 调用 wifi_link、perception、task_controller、record，后者再调用 vision、ball_vision、mode、actions；另有 config.py）；comm 与 wifi_link 之间有无线链路">
      <defs>
        <mask id="ftMask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="710" height="300">
          <rect x="0" y="0" width="710" height="300" fill="#fff" />
          {boxes.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="#000" />)}
        </mask>
      </defs>

      {/* 所有连线（在文字处断开） */}
      <g mask="url(#ftMask)">
        <path d={elbow(root.x, root.y, L1X, FW_C)} fill="none" stroke={C_FW} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />
        <path d={elbow(root.x, root.y, L1X, PY_C)} fill="none" stroke={C_PY} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />

        {fw.map((f) => (
          <path key={`f${f.name}`} d={elbow(L1X, FW_C, FW_X, f.y)} fill="none" stroke={C_FW} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
        ))}
        {py.filter((p) => p.lv === 2).map((p) => (
          <path key={`e${p.id}`} d={elbow(L1X, PY_C, X_OF[p.lv], p.y)} fill="none" stroke={C_PY} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
        ))}
        {py.filter((p) => p.parent && byId[p.parent]).map((p) => {
          const par = byId[p.parent]
          return (
            <path key={`c${p.id}`} d={elbowD(X_OF[par.lv], par.y, X_OF[p.lv], p.y)} fill="none" stroke={C_PY}
              strokeWidth={p.lv === 4 ? 1.3 : 1.6} strokeLinecap="round" strokeLinejoin="round" opacity={p.lv === 4 ? 0.4 : 0.6} />
          )
        })}

        {/* comm/ ↔ wifi_link.py 的无线链路（弧线） */}
        <path d={arc} fill="none" stroke={C_LINK} strokeWidth={1.8} strokeDasharray="6 5" strokeLinecap="round" opacity={0.8} />
      </g>

      {/* main/ 侧文字 */}
      {fw.map((f) => (
        <text key={`t${f.name}`} x={FW_X + 14} y={f.y + 4} fontSize={11.5}>
          <tspan fill={C_FW} fontWeight={600}>{f.name}</tspan>
          <tspan fill={DIM}>{'  ' + f.files}</tspan>
        </text>
      ))}
      {/* py/ 侧文字 */}
      {py.map((p) => (
        <text key={`tp${p.id}`} x={X_OF[p.lv] + 13} y={p.y + 4} fontSize={11.5}>
          <tspan fill={p.lv === 4 ? '#aeb9c4' : '#dbe3ea'}>{p.name}</tspan>
          {p.role && <tspan fill={DIM}>{'  ' + p.role}</tspan>}
        </text>
      ))}
      <text x={L1X - 14} y={FW_C - 14} fill={C_FW} fontSize={12} fontWeight={600} textAnchor="middle">main/ · C 固件</text>
      <text x={L1X - 21} y={PY_C - 14} fill={C_PY} fontSize={12} fontWeight={600} textAnchor="middle">py/ · 笔记本算法</text>
      <text x={root.x} y={root.y - 18} fill="#f4f7f8" fontSize={11.5} fontWeight={600} textAnchor="middle">car-esp</text>

      {/* 节点 */}
      {fw.map((f) => <circle key={`nf${f.name}`} cx={FW_X} cy={f.y} r={3.2} fill={C_FW} />)}
      {py.map((p) => <circle key={`np${p.id}`} cx={X_OF[p.lv]} cy={p.y} r={p.lv === 2 ? 3.6 : 3} fill={C_PY} opacity={p.lv === 4 ? 0.75 : 1} />)}
      <circle cx={L1X} cy={FW_C} r={7} fill="#0b0e12" stroke={C_FW} strokeWidth={2.4} />
      <circle cx={L1X} cy={PY_C} r={7} fill="#0b0e12" stroke={C_PY} strokeWidth={2.4} />
      <circle cx={root.x} cy={root.y} r={11} fill="#0b0e12" stroke="#62f1d1" strokeWidth={2.6} />
      <circle cx={root.x} cy={root.y} r={4} fill="#62f1d1" />

      {/* 小 wifi 标 */}
      <WifiMark x={icon.x} y={icon.y} c={C_LINK} />
    </svg>
  )
}
