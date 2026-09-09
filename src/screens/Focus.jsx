import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const R = 100
const C = 2 * Math.PI * R

function mmss(total) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function Focus() {
  const { session, patchSession } = useApp()
  const navigate = useNavigate()

  const ok = session?.minutes && session?.startedAt
  const totalSec = ok ? session.minutes * 60 : 0
  const target = ok ? session.startedAt + session.minutes * 60000 : 0

  const [remaining, setRemaining] = useState(() =>
    ok ? Math.max(0, Math.round((target - Date.now()) / 1000)) : 0,
  )

  useEffect(() => {
    if (!ok) return
    const tick = () => {
      const r = Math.max(0, Math.round((target - Date.now()) / 1000))
      setRemaining(r)
      if (r <= 0) navigate('/flow/done', { replace: true })
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [ok, target, navigate])

  // 화면이 꺼지지 않도록 (지원되는 기기에서만)
  useEffect(() => {
    let lock
    ;(async () => {
      try {
        lock = await navigator.wakeLock?.request('screen')
      } catch {
        /* 무시 */
      }
    })()
    return () => {
      try {
        lock?.release()
      } catch {
        /* 무시 */
      }
    }
  }, [])

  const offset = useMemo(() => {
    if (!totalSec) return 0
    const elapsed = totalSec - remaining
    return C * (elapsed / totalSec)
  }, [remaining, totalSec])

  if (!ok) return <Navigate to="/" replace />

  function stop() {
    patchSession({ endedEarly: true })
    navigate('/flow/done', { replace: true })
  }

  return (
    <div className="screen focus">
      <div className="focus__icon">{session.activity.icon}</div>
      <div className="focus__name">{session.activity.name}</div>

      <div className="focus__dial">
        <svg className="focus__ring" viewBox="0 0 220 220" aria-hidden>
          <circle className="track" cx="110" cy="110" r={R} />
          <circle
            className="bar"
            cx="110"
            cy="110"
            r={R}
            strokeDasharray={C}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="focus__center">
          <div className="focus__time">{mmss(remaining)}</div>
        </div>
      </div>

      <p className="focus__hint">지금은 이것만 해볼까요?</p>

      <button
        className="btn btn--text"
        onClick={stop}
        style={{ marginTop: 44 }}
      >
        여기까지 할래요
      </button>
    </div>
  )
}
