import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { MOODS_AFTER } from '../lib/constants.js'

export default function MoodAfter() {
  const { session, addRecord, clearSession } = useApp()
  const navigate = useNavigate()

  function choose(key) {
    addRecord({
      activity: session.activity,
      minutes: session.minutes,
      moodBefore: session.moodBefore,
      moodAfter: key,
      completed: !session.endedEarly,
    })
    clearSession()
    navigate('/', { replace: true })
  }

  return (
    <div className="screen screen--plain">
      <div style={{ marginTop: 24 }}>
        <p className="eyebrow">
          {session.activity.icon} {session.activity.name}
        </p>
        <h1 className="prompt">어땠어요?</h1>
      </div>

      <div className="choice-list stagger">
        {MOODS_AFTER.map((m) => (
          <button key={m.key} className="choice" onClick={() => choose(m.key)}>
            <span className="choice__emoji">{m.emoji}</span>
            <span className="choice__label">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="spacer" />
      <button
        className="btn btn--text btn--full"
        onClick={() => choose(null)}
      >
        그냥 마칠래요
      </button>
    </div>
  )
}
