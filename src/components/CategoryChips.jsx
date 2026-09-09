import { CATEGORIES } from '../lib/constants.js'

export default function CategoryChips({ selected, onToggle }) {
  return (
    <div className="chips">
      {CATEGORIES.map((cat) => {
        const on = selected.includes(cat)
        return (
          <button
            key={cat}
            type="button"
            className={'chip' + (on ? ' chip--on' : '')}
            aria-pressed={on}
            onClick={() => onToggle(cat)}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
