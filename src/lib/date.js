// 날짜는 항상 로컬 기준 'YYYY-MM-DD' 문자열 키로 다룬다.

export function dayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isSameDay(a, b) {
  return dayKey(a) === dayKey(b)
}

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 해당 월의 달력 그리드(6주 x 7일). 앞뒤로 이웃 달의 날짜가 채워진다.
export function monthMatrix(year, month /* 0-indexed */) {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)
  const weeks = []
  for (let w = 0; w < 6; w++) {
    const days = []
    for (let d = 0; d < 7; d++) {
      const cur = new Date(gridStart)
      cur.setDate(gridStart.getDate() + w * 7 + d)
      days.push({
        date: cur,
        key: dayKey(cur),
        inMonth: cur.getMonth() === month,
      })
    }
    weeks.push(days)
  }
  return weeks
}

export function monthLabel(year, month) {
  return `${year}년 ${month + 1}월`
}

export function prettyDay(key) {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return `${m}월 ${d}일 ${WEEKDAYS[date.getDay()]}요일`
}
