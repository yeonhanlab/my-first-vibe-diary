import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import BackButton from '../components/BackButton.jsx'
import { MOODS_BEFORE } from '../lib/constants.js'

export default function MoodBefore() {
  const { session, patchSession, clearSession } = useApp()
  const navigate = useNavigate()

  function choose(key) {
    patchSession({ moodBefore: key })
    navigate('/flow/time')
  }

  function cancel() {
    clearSession()
    navigate('/')
  }

  return (
    <div className="screen screen--plain">
      <button className="back-btn" onClick={cancel}>
        <span aria-hidden>‹</span> 그만두기
      </button>

      <div style={{ marginTop: 16 }}>
        <p className="eyebrow">
          {session.activity.icon} {session.activity.name}
        </p>
        <h1 className="prompt">지금 내 마음은?</h1>
      </div>

      <div className="choice-list stagger">
        {MOODS_BEFORE.map((m) => (
          <button
            key={m.key}
            className={
              'choice' + (session.moodBefore === m.key ? ' choice--on' : '')
            }
            onClick={() => choose(m.key)}
          >
            <span className="choice__emoji">{m.emoji}</span>
            <span className="choice__label">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="spacer" />
      <button
        className="btn btn--text btn--full"
        onClick={() => navigate('/flow/time')}
      >
        그냥 넘어갈래요
      </button>
    </div>
  )
}
