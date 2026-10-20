import type { Category, PracticeStep } from '../lib/types'
import { CATEGORY_LABELS } from '../lib/schedule'

type Props = {
  open: boolean
  steps: PracticeStep[]
  onPick: (index: number, round?: number) => void
  onClose: () => void
}

export function PickSessionDialog({ open, steps, onPick, onClose }: Props) {
  if (!open) return null

  const byCategory = new Map<Category, PracticeStep[]>()
  for (const step of steps) {
    const list = byCategory.get(step.category) ?? []
    list.push(step)
    byCategory.set(step.category, list)
  }

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="pick-session" role="dialog" aria-modal="true" aria-label="Pick your session">
        <div className="pick-session-head">
          <h2>Pick your session</h2>
          <button type="button" className="pick-session-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="pick-session-meta">
          Start the guided session from a section or a single activity. You&apos;ll begin there and
          continue through the end of the practice.
        </p>
        <div className="pick-session-list">
          {Array.from(byCategory.entries()).map(([category, items]) => {
            const firstIndex = steps.indexOf(items[0])
            return (
              <section key={category} className="pick-session-group">
                <button
                  type="button"
                  className="pick-session-category"
                  onClick={() => onPick(firstIndex)}
                >
                  <span className="pick-session-category-name">{CATEGORY_LABELS[category]}</span>
                  <span className="pick-session-category-meta">
                    Start at {CATEGORY_LABELS[category]} · {items.length} activit
                    {items.length === 1 ? 'y' : 'ies'}
                  </span>
                  <span className="pick-session-category-arrow">▸</span>
                </button>
                <ul className="pick-session-activities">
                  {items.map((item) => {
                    const index = steps.indexOf(item)
                    const roundCount = item.rounds ?? 0
                    return (
                      <li key={item.id} className="pick-session-activity-row">
                        <button
                          type="button"
                          className="pick-session-activity"
                          onClick={() => onPick(index)}
                        >
                          {item.name}
                        </button>
                        {roundCount > 0 && (
                          <div className="pick-session-rounds">
                            <span className="pick-session-rounds-label">Start round</span>
                            <div className="pick-session-rounds-list">
                              {Array.from({ length: roundCount }, (_, i) => i + 1).map((round) => (
                                <button
                                  key={round}
                                  type="button"
                                  className="pick-session-round"
                                  onClick={() => onPick(index, round)}
                                >
                                  {round}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
