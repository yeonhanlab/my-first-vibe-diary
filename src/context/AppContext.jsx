import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { KEYS, load, save, uid } from '../lib/storage.js'
import { defaultActivities } from '../lib/constants.js'
import { dayKey } from '../lib/date.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [profile, setProfileState] = useState(() => load(KEYS.profile, null))

  const [activities, setActivities] = useState(() => {
    const stored = load(KEYS.activities, null)
    if (stored && Array.isArray(stored)) return stored
    const seeded = defaultActivities()
    save(KEYS.activities, seeded)
    return seeded
  })

  const [records, setRecords] = useState(() => load(KEYS.records, []))

  // 진행 중인 휴식 흐름(활동 선택 → 마음 → 시간 → 집중). 저장하지 않고 메모리에만 둔다.
  const [session, setSession] = useState(null)

  useEffect(() => {
    save(KEYS.activities, activities)
  }, [activities])

  useEffect(() => {
    save(KEYS.records, records)
  }, [records])

  const api = useMemo(() => {
    return {
      profile,
      activities,
      records,
      session,

      saveProfile(next) {
        const merged = {
          name: '',
          photo: null,
          createdAt: Date.now(),
          ...(profile || {}),
          ...next,
        }
        setProfileState(merged)
        save(KEYS.profile, merged)
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
        return item
      },

      updateActivity(id, patch) {
        setActivities((list) =>
          list.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        )
      },

      removeActivity(id) {
        setActivities((list) => list.filter((a) => a.id !== id))
      },

      startSession(activity) {
        setSession({
          activity,
          moodBefore: null,
          minutes: null,
          startedAt: null,
        })
      },

      patchSession(patch) {
        setSession((s) => (s ? { ...s, ...patch } : s))
      },

      clearSession() {
        setSession(null)
      },

      // 휴식 하나를 마쳤을 때 기록으로 남긴다.
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
        return rec
      },

      recordsByDay(key) {
        return records
          .filter((r) => r.day === key)
          .sort((a, b) => a.at - b.at)
      },
    }
  }, [profile, activities, records, session])

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
