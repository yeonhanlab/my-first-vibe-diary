import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

// status:
//   'loading' — 저장된 세션을 복원하는 중 (첫 페인트)
//   'authed'  — 로그인됨 (user 존재)
//   'guest'   — 로그인 안 됨
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let alive = true

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data.session)
      setStatus(data.session ? 'authed' : 'guest')
    })

    // 로그인 / 로그아웃 / 토큰 갱신을 한 곳에서 반영한다.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setStatus(next ? 'authed' : 'guest')
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const api = useMemo(
    () => ({
      status,
      session,
      user: session?.user ?? null,

      // 회원가입. 프로젝트에서 "Confirm email" 을 꺼두면 곧바로 세션이 생긴다.
      // 켜져 있으면 session 이 null 로 오고, 메일 인증 후 로그인해야 한다.
      async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        return { needsEmailConfirm: !data.session }
      },

      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      },

      async signOut() {
        await supabase.auth.signOut()
      },
    }),
    [status, session],
  )

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
