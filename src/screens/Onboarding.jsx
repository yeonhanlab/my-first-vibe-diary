import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { fileToProfileImage } from '../lib/image.js'

export default function Onboarding() {
  const { saveProfile } = useApp()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [name, setName] = useState('')
  const [photo, setPhoto] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      setPhoto(await fileToProfileImage(file))
    } catch (err) {
      setError(err?.message || '사진을 불러오지 못했어요.')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  async function start() {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      await saveProfile({ name: name.trim() || '나', photo })
      navigate('/', { replace: true })
    } catch (err) {
      // 서버 저장이 실패하면 여기서 멈추고 원인을 보여준다 (예: RLS 정책 없음).
      setError(err?.message || String(err))
      setBusy(false)
    }
  }

  return (
    <div className="screen screen--sky">
      <div className="spacer" />
      <div className="center-block stagger">
        <p className="eyebrow">forMe</p>
        <h1 className="prompt">만나서 반가워요.</h1>
        <p className="subtle" style={{ marginTop: 10 }}>
          여기선 잠깐 멈추고,<br />
          나에게 돌아오는 연습을 해요.
        </p>

        <button
          className="avatar-pick"
          onClick={() => fileRef.current?.click()}
          style={{ marginTop: 28 }}
        >
          {photo ? <img src={photo} alt="" /> : <span>🌱</span>}
          <span className="avatar-pick__hint">
            {busy ? '불러오는 중…' : '사진 고르기'}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onFile}
        />

        <div className="field" style={{ textAlign: 'left' }}>
          <div className="field__label">뭐라고 부를까요?</div>
          <input
            className="text-input"
            placeholder="이름 또는 별명"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      <div className="spacer" />
      {error && (
        <p
          className="subtle center-block"
          style={{ marginBottom: 10, color: '#c0392b', whiteSpace: 'pre-wrap' }}
        >
          {error}
        </p>
      )}
      <button className="btn btn--primary btn--full" onClick={start} disabled={busy}>
        {busy ? '저장 중…' : '시작하기'}
      </button>
      <p className="subtle center-block" style={{ marginTop: 12, fontSize: '0.8rem' }}>
        입력한 내용은 이 기기에만 저장돼요.
      </p>
    </div>
  )
}
