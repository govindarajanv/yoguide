import type { DayId } from '../lib/types'
import {
  DAY_IDS,
  DAY_LABELS,
  formatDuration,
  planForDay,
  totalDurationSec,
  trackForDay,
  trackLabel,
} from '../lib/schedule'

type Props = {
  selected: DayId
  today: DayId
  onSelect: (day: DayId) => void
  onBack: () => void
  onOpenPractice: () => void
}

export function Week({ selected, today, onSelect, onBack, onOpenPractice }: Props) {
  const renderDayContent = (day: DayId) => {
    const plan = planForDay(day)
    const previewCore = plan
      .filter((step) => step.category === 'core' && step.id.startsWith('core-'))
      .slice(0, 5)
    const previewBreath = plan.filter((step) => step.category === 'pranayama')
    return (
      <>
        <div className="week-card-heading">
          <div>
            <span className="eyebrow">{trackLabel(trackForDay(day))}</span>
            <h2>{DAY_LABELS[day]}</h2>
          </div>
          <strong>{formatDuration(totalDurationSec(plan))}</strong>
        </div>
        <div className="week-card-section">
          <h3>Core highlights</h3>
          <p>{previewCore.map((step) => step.name).join(' · ')}</p>
        </div>
        <div className="week-card-section">
          <h3>Pranayama</h3>
          <p>{previewBreath.map((step) => step.name).join(' · ')}</p>
        </div>
      </>
    )
  }

  return (
    <section className="week">
      <header className="practice-bar">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Home
        </button>
        <strong>Week</strong>
        <button type="button" className="btn btn-ghost" onClick={onOpenPractice}>
          Practice
        </button>
      </header>

      <div className="week-chips" role="tablist" aria-label="Days of week">
        {DAY_IDS.map((day) => (
          <button
            key={day}
            type="button"
            role="tab"
            aria-selected={day === selected}
            className={[
              'week-chip',
              day === selected ? 'week-chip-active' : '',
              day === today ? 'week-chip-today' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelect(day)}
          >
            {DAY_LABELS[day].slice(0, 3)}
          </button>
        ))}
      </div>

      <p className="week-note">Preview only — check-offs stay on today.</p>

      <article className="week-selected">{renderDayContent(selected)}</article>

      <div className="week-grid">
        {DAY_IDS.map((day) => (
          <button
            type="button"
            key={day}
            className={[
              'week-card',
              day === today ? 'week-card-today' : '',
              day === selected ? 'week-card-selected' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelect(day)}
          >
            {renderDayContent(day)}
          </button>
        ))}
      </div>
    </section>
  )
}
