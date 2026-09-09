import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import FloatingActivities from '../components/FloatingActivities.jsx'

function sample(arr, n) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

export default function Home() {
  const { profile, activities, startSession } = useApp()
  const navigate = useNavigate()

  // 앱을 열 때마다 조금씩 다른 활동이 떠 있도록 매번 무작위로 고른다.
  const shown = useMemo(() => sample(activities, 5), [activities])

  function pick(activity) {
    startSession(activity)
    navigate('/flow/mood')
  }

  return (
    <div className="screen screen--sky">
      <div className="cloud cloud--a" />
      <div className="cloud cloud--b" />

      <div className="topbar">
        <button
          className="icon-btn"
          onClick={() => navigate('/calendar')}
          aria-label="쉼 달력"
        >
          📖
        </button>
        <button
          className="icon-btn"
          onClick={() => navigate('/profile')}
          aria-label="내 프로필"
        >
          🌿
        </button>
      </div>

      <div className="home-head">
        <p className="eyebrow">
          {profile?.name ? `${profile.name} 님,` : '오늘의 나에게,'}
        </p>
        <h1 className="prompt">오늘은 어떻게<br />기분전환을 해볼까요?</h1>
      </div>

      <div className="orbit-wrap">
        {activities.length === 0 ? (
          <div className="center-block">
            <p className="empty">
              아직 등록한 활동이 없어요.<br />
              좋아하는 작은 일 하나를 더해볼까요?
            </p>
            <button
              className="btn btn--primary"
              onClick={() => navigate('/add')}
              style={{ marginTop: 8 }}
            >
              ＋ 활동 더하기
            </button>
          </div>
        ) : (
          <FloatingActivities
            profile={profile}
            items={shown}
            onPick={pick}
            onAdd={() => navigate('/add')}
            onProfile={() => navigate('/profile')}
          />
        )}
      </div>

      <div className="home-foot">
        <button className="btn btn--text" onClick={() => navigate('/all')}>
          전체 보기
        </button>
      </div>
    </div>
  )
}
