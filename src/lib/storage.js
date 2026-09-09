// forMe 는 백엔드가 없다. 모든 데이터는 이 브라우저의 localStorage 에만 남는다.

export const KEYS = {
  profile: 'forme.profile.v1',
  activities: 'forme.activities.v1',
  records: 'forme.records.v1',
}

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    // 용량 초과(주로 프로필 사진) 등은 조용히 무시한다.
    return false
  }
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}
