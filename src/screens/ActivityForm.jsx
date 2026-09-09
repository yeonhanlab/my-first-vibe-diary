import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import BackButton from '../components/BackButton.jsx'
import IconPicker from '../components/IconPicker.jsx'
import CategoryChips from '../components/CategoryChips.jsx'
import { ICON_CHOICES } from '../lib/constants.js'

export default function ActivityForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activities, addActivity, updateActivity, removeActivity } = useApp()

  const editing = id ? activities.find((a) => a.id === id) : null

  const [name, setName] = useState(editing?.name ?? '')
  const [icon, setIcon] = useState(editing?.icon ?? ICON_CHOICES[0])
  const [categories, setCategories] = useState(editing?.categories ?? [])

  const canSave = name.trim().length > 0

  function toggleCat(cat) {
    setCategories((cur) =>
      cur.includes(cat) ? cur.filter((c) => c !== cat) : [...cur, cat],
    )
  }

  function submit() {
    if (!canSave) return
    if (editing) {
      updateActivity(editing.id, { name: name.trim(), icon, categories })
    } else {
      addActivity({ name, icon, categories })
    }
    navigate('/all')
  }

  function onDelete() {
    if (!editing) return
    if (window.confirm(`'${editing.name}' 을(를) 지울까요?`)) {
      removeActivity(editing.id)
      navigate('/all')
    }
  }

  return (
    <div className="screen screen--plain">
      <BackButton label="취소" />

      <h1 className="section-title" style={{ marginTop: 12 }}>
        {editing ? '활동 다듬기' : '새로운 활동'}
      </h1>

      <div className="field">
        <div className="field__label">활동 이름</div>
        <input
          className="text-input"
          placeholder="예: 예쁜 카페에서 책 읽기"
          value={name}
          maxLength={30}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="field">
        <div className="field__label">아이콘 · 지금은 {icon}</div>
        <IconPicker value={icon} onChange={setIcon} />
      </div>

      <div className="field">
        <div className="field__label">
          어떤 결의 시간인가요? <span className="subtle">(여러 개 골라도 좋아요)</span>
        </div>
        <CategoryChips selected={categories} onToggle={toggleCat} />
      </div>

      <div className="spacer" style={{ minHeight: 24 }} />

      <button
        className="btn btn--primary btn--full"
        disabled={!canSave}
        onClick={submit}
      >
        {editing ? '저장하기' : '추가하기'}
      </button>

      {editing && (
        <button
          className="btn btn--text btn--full"
          onClick={onDelete}
          style={{ marginTop: 8, color: 'var(--coral-deep)' }}
        >
          이 활동 지우기
        </button>
      )}
    </div>
  )
}
