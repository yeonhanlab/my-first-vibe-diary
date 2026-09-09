import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import BackButton from '../components/BackButton.jsx'

export default function AllActivities() {
  const { activities, startSession } = useApp()
  const navigate = useNavigate()

  function pick(activity) {
    startSession(activity)
    navigate('/flow/mood')
  }

  return (
    <div className="screen screen--plain">
      <BackButton to="/" label="홈" />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
        }}
      >
        <h1 className="section-title">좋아하는 활동</h1>
        <button className="btn btn--ghost" onClick={() => navigate('/add')}>
          ＋ 추가
        </button>
      </div>
      <p className="subtle" style={{ marginTop: 6 }}>
        하나를 고르면 바로 시작해요.
      </p>

      {activities.length === 0 ? (
        <div className="empty">아직 활동이 없어요.</div>
      ) : (
        <div className="list stagger">
          {activities.map((a) => (
            <div key={a.id} className="row">
              <button
                className="row__emoji"
                onClick={() => pick(a)}
                aria-label={`${a.name} 시작`}
                style={{ background: 'none' }}
              >
                {a.icon}
              </button>
              <button
                className="row__body"
                onClick={() => pick(a)}
                style={{ background: 'none', textAlign: 'left' }}
              >
                <div className="row__name">{a.name}</div>
                {a.categories.length > 0 && (
                  <div className="row__tags">{a.categories.join(' · ')}</div>
                )}
              </button>
              <button
                className="row__chev"
                onClick={() => navigate(`/edit/${a.id}`)}
                aria-label={`${a.name} 편집`}
                style={{ background: 'none', padding: 8 }}
              >
                ✎
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
