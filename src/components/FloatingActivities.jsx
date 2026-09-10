// 중앙의 프로필을 중심으로 활동 아이콘이 위성처럼 천천히 돌며 둥둥 떠 있는 첫 화면.

const BUBBLE_TINTS = [
  'rgba(240, 182, 164, 0.85)', // coral
  'rgba(169, 203, 158, 0.85)', // sage
  'rgba(246, 220, 160, 0.9)', // butter
  'rgba(213, 196, 230, 0.85)', // lilac
  'rgba(169, 211, 234, 0.85)', // sky blue
]

export default function FloatingActivities({ profile, items, onPick, onAdd, onProfile }) {
  // items 뒤에 '추가' 버블을 하나 더 붙인다.
  const nodes = [...items.map((it) => ({ type: 'activity', it })), { type: 'add' }]
  const count = nodes.length
  const radius = 39 // % of orbit box

  return (
    <div className="orbit">
      <div className="orbit__ring">
        {nodes.map((node, i) => {
          // 위쪽(-90deg)부터 시계방향으로 고르게 배치
          const angle = (i / count) * 2 * Math.PI - Math.PI / 2
          const left = 50 + radius * Math.cos(angle)
          const top = 50 + radius * Math.sin(angle)
          const size = 62 + ((i % 3) * 7)
          const bobDur = 5 + ((i * 0.7) % 3)
          const bobDelay = (i * 0.45) % 2.5

          if (node.type === 'add') {
            return (
              <div
                key="add"
                className="bubble bubble--add"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div className="bubble__inner">
                  <button
                    className="bubble__bob"
                    style={{
                      '--bubble-size': `${size}px`,
                      '--bob-dur': `${bobDur}s`,
                      '--bob-delay': `${bobDelay}s`,
                    }}
                    onClick={onAdd}
                    aria-label="활동 추가"
                  >
                    <span className="bubble__emoji">＋</span>
                  </button>
                </div>
              </div>
            )
          }

          const { it } = node
          return (
            <div
              key={it.id}
              className="bubble"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <div className="bubble__inner">
                <button
                  className="bubble__bob"
                  style={{
                    '--bubble-size': `${size}px`,
                    '--bubble-bg': BUBBLE_TINTS[i % BUBBLE_TINTS.length],
                    '--bob-dur': `${bobDur}s`,
                    '--bob-delay': `${bobDelay}s`,
                  }}
                  onClick={() => onPick(it)}
                  aria-label={it.name}
                >
                  <span className="bubble__emoji">{it.icon}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button
        className="orbit__planet"
        onClick={onProfile}
        aria-label="내 프로필"
      >
        {profile?.photo ? (
          <img src={profile.photo} alt="" />
        ) : (
          <span className="orbit__planet-fallback">🌱</span>
        )}
      </button>
    </div>
  )
}
