import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './AuthContext.jsx'
import { loadCache, saveCache, clearCache, uid } from '../lib/storage.js'
import { defaultActivities } from '../lib/constants.js'
import { dayKey } from '../lib/date.js'

const AppContext = createContext(null)

// ── DB(snake_case) ↔ 앱(camelCase) 변환 ─────────────────────────
const fromProfileRow = (r) =>
  r && { name: r.name ?? '', photo: r.photo ?? null, createdAt: Date.parse(r.created_at) || Date.now() }

const fromActivityRow = (r) => ({
  id: r.id,
  name: r.name,
  icon: r.icon,
  categories: r.categories ?? [],
  createdAt: Date.parse(r.created_at) || Date.now(),
})
const toActivityRow = (userId, a) => ({
  id: a.id,
  user_id: userId,
  name: a.name,
  icon: a.icon,
  categories: a.categories ?? [],
})

const fromRecordRow = (r) => ({
  id: r.id,
  day: r.day,
  at: Number(r.at),
  activityId: r.activity_id ?? null,
  activityName: r.activity_name ?? '',
  activityIcon: r.activity_icon ?? '🫧',
  minutes: r.minutes ?? 0,
  moodBefore: r.mood_before ?? null,
  moodAfter: r.mood_after ?? null,
  completed: r.completed !== false,
})
const toRecordRow = (userId, rec) => ({
  id: rec.id,
  user_id: userId,
  day: rec.day,
  at: rec.at,
  activity_id: rec.activityId,
  activity_name: rec.activityName,
  activity_icon: rec.activityIcon,
  minutes: rec.minutes,
  mood_before: rec.moodBefore,
  mood_after: rec.moodAfter,
  completed: rec.completed,
})

export function AppProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const [profile, setProfileState] = useState(null)
  const [activities, setActivities] = useState([])
  const [records, setRecords] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [syncError, setSyncError] = useState(null)

  // 진행 중인 휴식 흐름(활동 → 마음 → 시간 → 집중). 서버에 저장하지 않고 메모리에만 둔다.
  const [session, setSession] = useState(null)

  // 로그인 사용자가 바뀔 때: 캐시로 즉시 그리고, 서버에서 최신값을 받아 덮어쓴다.
  useEffect(() => {
    if (!userId) {
      setProfileState(null)
      setActivities([])
      setRecords([])
      setLoaded(false)
      setSyncError(null)
      return
    }

    const cached = loadCache(userId)
    if (cached) {
      setProfileState(cached.profile ?? null)
      setActivities(cached.activities ?? [])
      setRecords(cached.records ?? [])
    }
    setLoaded(false)

    let cancelled = false
    ;(async () => {
      try {
        const [pRes, aRes, rRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
          supabase.from('activities').select('*').eq('user_id', userId).order('created_at'),
          supabase.from('records').select('*').eq('user_id', userId).order('at', { ascending: false }),
        ])
        if (pRes.error) throw pRes.error
        if (aRes.error) throw aRes.error
        if (rRes.error) throw rRes.error
        if (cancelled) return

        let acts = (aRes.data ?? []).map(fromActivityRow)

        // 첫 로그인이라 활동이 하나도 없으면 기본 활동을 심는다.
        // id 를 (userId + 순번)으로 고정해, StrictMode 이중 실행이나 재시도로 두 번
        // 호출돼도 upsert(ignoreDuplicates)가 중복 삽입을 막는다.
        if (acts.length === 0) {
          const seeded = defaultActivities().map((a, i) => ({
            ...a,
            id: `${userId}-seed-${i}`,
          }))
          const { error } = await supabase
            .from('activities')
            .upsert(seeded.map((a) => toActivityRow(userId, a)), {
              onConflict: 'id',
              ignoreDuplicates: true,
            })
          if (error) throw error
          acts = seeded
        }

        if (cancelled) return
        const prof = fromProfileRow(pRes.data)
        const recs = (rRes.data ?? []).map(fromRecordRow)
        setProfileState(prof)
        setActivities(acts)
        setRecords(recs)
        setSyncError(null)
        saveCache(userId, { profile: prof, activities: acts, records: recs })
      } catch (e) {
        if (!cancelled) setSyncError(e)
        console.warn('[forMe] 서버 동기화 실패:', e?.message ?? e)
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

  // 상태가 바뀔 때마다 캐시를 갱신한다 (다음 실행의 첫 페인트용).
  useEffect(() => {
    if (userId && loaded) saveCache(userId, { profile, activities, records })
  }, [userId, loaded, profile, activities, records])

  const api = useMemo(() => {
    // 낙관적 업데이트 헬퍼: 화면을 먼저 바꾸고, 서버 요청이 실패하면 되돌린다.
    async function optimistic(revert, run) {
      try {
        const { error } = await run()
        if (error) throw error
        setSyncError(null)
      } catch (e) {
        revert()
        setSyncError(e)
        console.warn('[forMe] 저장 실패, 되돌립니다:', e?.message ?? e)
      }
    }

    return {
      profile,
      activities,
      records,
      session,
      loaded,
      syncError,

      // 온보딩에서 이 결과를 기다렸다가(성공해야) 홈으로 넘어간다.
      // 실패하면 에러를 그대로 throw 해서 화면이 원인을 보여줄 수 있게 한다.
      async saveProfile(next) {
        const merged = {
          name: '',
          photo: null,
          createdAt: Date.now(),
          ...(profile || {}),
          ...next,
        }
        const prev = profile
        setProfileState(merged)
        try {
          const { error } = await supabase.from('profiles').upsert({
            user_id: userId,
            name: merged.name,
            photo: merged.photo,
          })
          if (error) throw error
          setSyncError(null)
        } catch (e) {
          setProfileState(prev)
          setSyncError(e)
          console.warn('[forMe] 프로필 저장 실패:', e?.message ?? e)
          throw e
        }
      },

      addActivity({ name, icon, categories }) {
        const item = {
          id: uid(),
          name: name.trim(),
          icon,
          categories: categories || [],
          createdAt: Date.now(),
        }
        setActivities((list) => [...list, item])
        optimistic(
          () => setActivities((list) => list.filter((a) => a.id !== item.id)),
          () => supabase.from('activities').insert(toActivityRow(userId, item)),
        )
        return item
      },

      updateActivity(id, patch) {
        const prev = activities
        setActivities((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)))
        optimistic(
          () => setActivities(prev),
          () =>
            supabase
              .from('activities')
              .update({
                name: patch.name,
                icon: patch.icon,
                categories: patch.categories,
              })
              .eq('id', id),
        )
      },

      removeActivity(id) {
        const prev = activities
        setActivities((list) => list.filter((a) => a.id !== id))
        optimistic(
          () => setActivities(prev),
          () => supabase.from('activities').delete().eq('id', id),
        )
      },

      startSession(activity) {
        setSession({ activity, moodBefore: null, minutes: null, startedAt: null })
      },

      patchSession(patch) {
        setSession((s) => (s ? { ...s, ...patch } : s))
      },

      clearSession() {
        setSession(null)
      },

      addRecord({ activity, minutes, moodBefore, moodAfter, completed }) {
        const now = new Date()
        const rec = {
          id: uid(),
          day: dayKey(now),
          at: now.getTime(),
          activityId: activity?.id ?? null,
          activityName: activity?.name ?? '',
          activityIcon: activity?.icon ?? '🫧',
          minutes,
          moodBefore: moodBefore ?? null,
          moodAfter: moodAfter ?? null,
          completed: completed !== false,
        }
        setRecords((list) => [rec, ...list])
        optimistic(
          () => setRecords((list) => list.filter((r) => r.id !== rec.id)),
          () => supabase.from('records').insert(toRecordRow(userId, rec)),
        )
        return rec
      },

      recordsByDay(key) {
        return records.filter((r) => r.day === key).sort((a, b) => a.at - b.at)
      },
    }
  }, [profile, activities, records, session, loaded, syncError, userId])

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export { clearCache }
