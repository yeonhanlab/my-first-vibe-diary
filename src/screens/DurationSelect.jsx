import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import BackButton from '../components/BackButton.jsx'
import { DURATIONS } from '../lib/constants.js'

export default function DurationSelect() {
  const { session, patchSession } = useApp()
  const navigate = useNavigate()

  function choose(minutes) {
    patchSession({ minutes, startedAt: Date.now() })
    navigate('/flow/focus')
  }

  return (
    <div className="screen screen--plain">
      <BackButton label="뒤로" />

      <div style={{ marginTop: 16 }}>
        <p className="eyebrow">
          {session.activity.icon} {session.activity.name}
        </p>
        <h1 className="prompt">얼마나 나를 위해<br />써볼까요?</h1>
      </div>

      <div className="duration-grid stagger">
        {DURATIONS.map((d) => (
          <button
            key={d.minutes}
            className="duration"
            onClick={() => choose(d.minutes)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="spacer" />
      <p className="subtle center-block">
        짧아도 괜찮아요. 10분이면 충분해요.
      </p>
    </div>
  )
}
