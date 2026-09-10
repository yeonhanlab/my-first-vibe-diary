import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const isSignup = mode === 'signup'
  const canSubmit = email.trim().length > 3 && password.length >= 6 && !busy

  async function submit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (isSignup) {
        const { needsEmailConfirm } = await signUp(email.trim(), password)
        if (needsEmailConfirm) {
          setNotice('메일함을 확인해 이메일 인증을 마친 뒤 로그인해 주세요.')
          setMode('signin')
          return
        }
      } else {
        await signIn(email.trim(), password)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(translate(err?.message))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen screen--sky">
      <div className="spacer" />
      <form className="center-block stagger" onSubmit={submit}>
        <p className="eyebrow">forMe</p>
        <h1 className="prompt">
          {isSignup ? (
            '처음이시군요.'
          ) : (
            <>
              다시 만나서<br />반가워요.
            </>
          )}
        </h1>
        <p className="subtle" style={{ marginTop: 10 }}>
          기록은 이제 계정에 안전하게 저장돼요.
        </p>

        <div className="field" style={{ textAlign: 'left', marginTop: 24 }}>
          <div className="field__label">이메일</div>
          <input
            className="text-input"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field" style={{ textAlign: 'left' }}>
          <div className="field__label">비밀번호 (6자 이상)</div>
          <input
            className="text-input"
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="subtle" style={{ color: 'var(--coral-deep)', marginTop: 4 }}>
            {error}
          </p>
        )}
        {notice && (
          <p className="subtle" style={{ marginTop: 4 }}>
            {notice}
          </p>
        )}

        <button
          className="btn btn--primary btn--full"
          type="submit"
          disabled={!canSubmit}
          style={{ marginTop: 20 }}
        >
          {busy ? '잠시만요…' : isSignup ? '가입하고 시작하기' : '로그인'}
        </button>

        <button
          type="button"
          className="btn btn--text btn--full"
          onClick={() => {
            setMode(isSignup ? 'signin' : 'signup')
            setError('')
            setNotice('')
          }}
          style={{ marginTop: 8 }}
        >
          {isSignup ? '이미 계정이 있어요' : '계정 만들기'}
        </button>
      </form>
      <div className="spacer" />
    </div>
  )
}

function translate(message) {
  if (!message) return '문제가 생겼어요. 잠시 후 다시 시도해 주세요.'
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return '이메일 또는 비밀번호가 맞지 않아요.'
  if (m.includes('already registered')) return '이미 가입된 이메일이에요. 로그인해 주세요.'
  if (m.includes('email not confirmed')) return '아직 이메일 인증이 안 됐어요. 메일함을 확인해 주세요.'
  if (m.includes('password')) return '비밀번호는 6자 이상이어야 해요.'
  return message
}
