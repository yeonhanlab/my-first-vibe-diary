// 이제 데이터의 원본(source of truth)은 Supabase 다.
// localStorage 는 "오프라인 캐시"로만 쓴다 — 앱을 다시 열었을 때 서버 응답을 기다리지
// 않고 마지막으로 본 화면을 즉시 그려주기 위한 것. 서버 응답이 오면 덮어쓴다.

const CACHE_PREFIX = 'forme.cache.v2.'

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

// 캐시는 사용자별로 분리한다 (로그아웃 후 다른 계정으로 로그인해도 안 섞이도록).
function cacheKey(userId) {
  return CACHE_PREFIX + userId
}

export function loadCache(userId) {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(cacheKey(userId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveCache(userId, data) {
  if (!userId) return
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(data))
  } catch {
    // 프로필 사진 등으로 용량을 초과하면 조용히 넘어간다. 서버에는 이미 저장돼 있다.
  }
}

export function clearCache(userId) {
  try {
    if (userId) localStorage.removeItem(cacheKey(userId))
  } catch {
    /* 무시 */
  }
}
