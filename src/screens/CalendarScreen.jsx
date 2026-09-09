import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import BackButton from '../components/BackButton.jsx'
import {
  dayKey,
  monthLabel,
  monthMatrix,
  prettyDay,
  WEEKDAYS,
} from '../lib/date.js'
import { MOODS_AFTER, MOODS_BEFORE, moodEmoji } from '../lib/constants.js'

const todayKey = dayKey()

export default function CalendarScreen() {
  const { records, recordsByDay } = useApp()
  const now = new Date()

  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState(todayKey)

  const weeks = monthMatrix(year, month)
  const dayRecords = recordsByDay(selected)

  function shift(delta) {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  const monthCount = records.filter((r) =>
    r.day.startsWith(
      `${year}-${String(month + 1).padStart(2, '0')}`,
    ),
  ).length

  return (
    <div className="screen screen--plain">
      <BackButton to="/" label="홈" />

      <h1 className="section-title" style={{ marginTop: 12 }}>
        쉼 달력
      </h1>

      <div className="cal-head">
        <button className="icon-btn" onClick={() => shift(-1)} aria-label="이전 달">
          ‹
        </button>
        <div className="cal-title">{monthLabel(year, month)}</div>
        <button className="icon-btn" onClick={() => shift(1)} aria-label="다음 달">
          ›
        </button>
      </div>
      <p className="subtle center-block" style={{ marginTop: 6 }}>
        {monthCount > 0
          ? `이 달에 ${monthCount}번, 나에게 돌아왔어요.`
          : '이 달의 첫 쉼을 기다리고 있어요.'}
      </p>

      <div className="cal-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="cal-wd">
            {w}
          </div>
        ))}
        {weeks.flat().map((cell) => {
          const recs = recordsByDay(cell.key)
          const has = recs.length > 0
          const classes = ['cal-cell']
          if (!cell.inMonth) classes.push('cal-cell--out')
          if (cell.key === todayKey) classes.push('cal-cell--today')
          if (has) classes.push('cal-cell--has')
          if (cell.key === selected) classes.push('cal-cell--sel')
          return (
            <button
              key={cell.key}
              className={classes.join(' ')}
              onClick={() => setSelected(cell.key)}
            >
              <span>{cell.date.getDate()}</span>
              {has && <span className="cal-dot">{recs[0].activityIcon}</span>}
            </button>
          )
        })}
      </div>

      <div className="day-panel">
        <div className="day-panel__title">{prettyDay(selected)}</div>
        {dayRecords.length === 0 ? (
          <p className="empty">이 날의 쉼 기록은 아직 없어요.</p>
        ) : (
          dayRecords.map((r) => (
            <div key={r.id} className="record-card">
              <span className="record-card__emoji">{r.activityIcon}</span>
              <div className="record-card__meta">
                <div className="record-card__name">{r.activityName}</div>
                <div className="record-card__sub">
                  {r.minutes}분{r.completed ? '' : ' · 중간에 마침'}
                </div>
              </div>
              <span className="record-card__mood">
                {moodEmoji(MOODS_BEFORE, r.moodBefore)}
                {r.moodBefore && r.moodAfter ? ' → ' : ''}
                {moodEmoji(MOODS_AFTER, r.moodAfter)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
