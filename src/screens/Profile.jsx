import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import BackButton from '../components/BackButton.jsx'
import { fileToProfileImage } from '../lib/image.js'

export default function Profile() {
  const { profile, saveProfile, records } = useApp()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [name, setName] = useState(profile?.name ?? '')
  const [photo, setPhoto] = useState(profile?.photo ?? null)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const totalMinutes = records.reduce((sum, r) => sum + (r.minutes || 0), 0)

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      setPhoto(await fileToProfileImage(file))
    } catch {
      /* 무시 */
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  function save() {
    saveProfile({ name: name.trim() || '나', photo })
    setSaved(true)
    setTimeout(() => navigate('/'), 500)
  }

  return (
    <div className="screen screen--plain">
      <BackButton to="/" label="홈" />

      <h1 className="section-title" style={{ marginTop: 12 }}>
        나
      </h1>

      <button
        className="avatar-pick"
        onClick={() => fileRef.current?.click()}
        style={{ marginTop: 20 }}
      >
        {photo ? <img src={photo} alt="" /> : <span>🌱</span>}
        <span className="avatar-pick__hint">{busy ? '불러오는 중…' : '사진 바꾸기'}</span>
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />

      <div className="field">
        <div className="field__label">이름</div>
        <input
          className="text-input"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {records.length > 0 && (
        <p className="subtle center-block" style={{ marginTop: 28 }}>
          지금까지 {records.length}번, 약 {totalMinutes}분을<br />
          나를 위해 썼어요.
        </p>
      )}

      <div className="spacer" style={{ minHeight: 24 }} />
      <button className="btn btn--primary btn--full" onClick={save}>
        {saved ? '저장했어요' : '저장하기'}
      </button>

      <button
        className="btn btn--text btn--full"
        onClick={async () => {
          await signOut()
          navigate('/login', { replace: true })
        }}
        style={{ marginTop: 8 }}
      >
        로그아웃{user?.email ? ` · ${user.email}` : ''}
      </button>
    </div>
  )
}
