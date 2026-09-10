// Supabase 클라이언트. forMe 의 유일한 백엔드 연결점이다.
// 값은 .env.local 에서 온다 (VITE_ 접두사가 붙어야 브라우저 번들에 포함된다).
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // 설정을 빼먹으면 화면이 하얗게 뜨는 대신 콘솔에서 바로 원인을 알 수 있게 한다.
  throw new Error(
    'Supabase 환경변수가 없습니다. .env.local 에 VITE_SUPABASE_URL 과 ' +
      'VITE_SUPABASE_ANON_KEY 를 넣고 dev 서버를 다시 시작하세요. (SUPABASE_SETUP.md 참고)',
  )
}

export const supabase = createClient(url, anonKey, {
  auth: {
    // 세션(로그인 토큰)을 localStorage 에 보관하고 새로고침 시 자동 복원한다.
    persistSession: true,
    autoRefreshToken: true,
  },
})
