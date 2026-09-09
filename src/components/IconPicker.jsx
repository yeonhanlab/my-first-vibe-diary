import { ICON_CHOICES } from '../lib/constants.js'

export default function IconPicker({ value, onChange }) {
  return (
    <div className="icon-grid" role="listbox" aria-label="아이콘 선택">
      {ICON_CHOICES.map((icon) => (
        <button
          key={icon}
          type="button"
          role="option"
          aria-selected={value === icon}
          className={'icon-cell' + (value === icon ? ' icon-cell--on' : '')}
          onClick={() => onChange(icon)}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
