import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { DONE_MESSAGES } from '../lib/constants.js'

export default function Done() {
  const { session, addRecord, clearSession } = useApp()
  const navigate = useNavigate()

  const [msg] = useState(
    () => DONE_MESSAGES[Math.floor(Math.random() * DONE_MESSAGES.length)],
  )

  function finishNow() {
    addRecord({
      activity: session.activity,
      minutes: session.minutes,
      moodBefore: session.moodBefore,
      moodAfter: null,
      completed: !session.endedEarly,
    })
    clearSession()
    navigate('/', { replace: true })
  }

  return (
    <div className="screen done">
      <div className="spacer" />
      <div className="done__mark">🫧</div>
      <p className="done__msg">{msg}</p>
      <p className="subtle">
        {session.activity.icon} {session.activity.name} · {session.minutes}분
      </p>

      <div className="spacer" />

      <button
        className="btn btn--primary btn--full"
        onClick={() => navigate('/flow/after')}
      >
        어땠는지 살짝 남길게요
      </button>
      <button className="btn btn--text btn--full" onClick={finishNow} style={{ marginTop: 8 }}>
        이대로 마칠래요
      </button>
    </div>
  )
}
