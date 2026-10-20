import type { DayId, PracticeStep } from '../lib/types'
import type { DayProgress } from '../lib/progress'
import type { Theme } from '../hooks/useTheme'
import { ThemeToggle } from './ThemeToggle'
import { BlocksIcon } from './BlocksIcon'
import {
  DAY_LABELS,
  blocksForChairYoga,
  blocksForDay,
  formatDuration,
  totalDurationSec,
  trackForDay,
  trackLabel,
} from '../lib/schedule'

type Props = {
  day: DayId
  today: DayId
  progress: DayProgress
  travelMode?: boolean
  onBack: () => void
  onOpenPractice: () => void
  theme: Theme
  onToggleTheme: () => void
}

function formatDose(step: PracticeStep): string {
  const parts = [`${step.sets}×${step.reps}`, `~${step.durationSec}s`]
  return parts.join(' · ')
}

export function Today({
  day,
  today,
  progress,
  travelMode = false,
  onBack,
  onOpenPractice,
  theme,
  onToggleTheme,
}: Props) {
  const blocks = travelMode ? blocksForChairYoga() : blocksForDay(day)
  const totalSteps = blocks.reduce((sum, block) => sum + block.steps.length, 0)
  const done = blocks.reduce(
    (sum, block) => sum + block.steps.filter((step) => progress[step.id]).length,
    0,
  )
  const totalSec = blocks.reduce((sum, block) => sum + totalDurationSec(block.steps), 0)

  return (
    <section className="today">
      <header className="practice-bar">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Home
        </button>
        <div className="practice-bar-mid">
          <strong>{travelMode ? 'Chair Yoga activities' : "Today's activities"}</strong>
          <span>
            {!travelMode && day === today ? 'Today · ' : ''}
            {done}/{totalSteps} · {formatDuration(totalSec).replace('~', '')}
          </span>
        </div>
        <div className="masthead-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button type="button" className="btn btn-ghost" onClick={onOpenPractice}>
            Practice
          </button>
        </div>
      </header>

      <div className="today-heading">
        <BlocksIcon count={blocks.length} />
        <div>
          <span className="eyebrow">
            {travelMode ? 'Chair mode · Chair Yoga' : trackLabel(trackForDay(day))}
          </span>
          <h1 className="today-title">{travelMode ? 'Chair Yoga' : DAY_LABELS[day]}</h1>
        </div>
      </div>

      <p className="week-note">
        {travelMode
          ? 'Chair routine — two practice blocks (Practice & Wind-down).'
          : blocks.length === 2
            ? 'Sun / Tue / Thu / Sat routine — two practice blocks.'
            : 'Mon / Wed / Fri routine — one practice block.'}
      </p>

      {blocks.map((block) => (
        <div key={block.label || block.name} className="today-block">
          <div className="cat-head">
            {block.label && <p className="eyebrow">{block.label}</p>}
            <h2 className="today-block-title">{block.name}</h2>
            <p className="cat-duration">{formatDuration(totalDurationSec(block.steps)).replace('~', '')}</p>
          </div>
          <ul className="step-list">
            {block.steps.map((step) => {
              const checked = !!progress[step.id]
              return (
                <li
                  key={step.id}
                  className={['step', checked ? 'step-done' : ''].filter(Boolean).join(' ')}
                >
                  <div className="step-body">
                    <div className="step-head">
                      <h3>
                        {checked && <span className="today-check">✓ </span>}
                        {step.name}
                      </h3>
                      <span className="step-dose">{formatDose(step)}</span>
                    </div>
                    <p className="step-cue">{step.cue}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}
