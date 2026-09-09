import { useNavigate } from 'react-router-dom'

export default function BackButton({ to, label = '뒤로' }) {
  const navigate = useNavigate()
  return (
    <button
      className="back-btn"
      onClick={() => (to ? navigate(to) : navigate(-1))}
    >
      <span aria-hidden>‹</span> {label}
    </button>
  )
}
