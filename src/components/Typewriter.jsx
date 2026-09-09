import { useEffect, useState } from 'react'

// 轻量打字机（无第三方依赖）：打字 → 停顿 → 删除 → 重打
export default function Typewriter({ text, speed = 75, pause = 1900, cursor = '|', className = '' }) {
  const [displayed, setDisplayed] = useState('')
  const [idx, setIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const full = text
    let t
    if (!deleting) {
      if (idx < full.length) {
        t = setTimeout(() => { setDisplayed(full.slice(0, idx + 1)); setIdx(i => i + 1) }, speed)
      } else {
        t = setTimeout(() => setDeleting(true), pause)
      }
    } else if (idx > 0) {
      t = setTimeout(() => { setDisplayed(full.slice(0, idx - 1)); setIdx(i => i - 1) }, speed * 0.45)
    } else {
      setDeleting(false)
      t = setTimeout(() => { setIdx(0) }, 360)
    }
    return () => clearTimeout(t)
  }, [idx, deleting, text, speed, pause])

  return (
    <span className={className}>
      {displayed}
      <span className="type-cursor" aria-hidden="true">{cursor}</span>
    </span>
  )
}
