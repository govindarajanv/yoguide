import { useEffect, useRef } from 'react'
import type { DayId, PracticeStep } from '../lib/types'
import {
  CATEGORY_LABELS,
  DAY_LABELS,
  formatDuration,
  groupByCategory,
  totalDurationSec,
} from '../lib/schedule'
import type { DayProgress } from '../lib/progress'

type Props = {
  day: DayId
  steps: PracticeStep[]
  progress: DayProgress
  rounds: number
  onToggle: (stepId: string) => void
  onRounds: (next: number) => void
  onBack: () => void
  onMarkDone: () => void
  isComplete: boolean
  guidedCurrentId: string | null
  guidedActive: boolean
}

function formatDose(step: PracticeStep): string {
  const parts = [`${step.sets}×${step.reps}`, `~${step.durationSec}s`]
  return parts.join(' · ')
}

export function Practice({
  day,
  steps,
  progress,
  rounds,
  onToggle,
  onRounds,
  onBack,
  onMarkDone,
  isComplete,
  guidedCurrentId,
  guidedActive,
}: Props) {
  const groups = groupByCategory(steps)
  const currentId = guidedActive ? guidedCurrentId : steps.find((s) => !progress[s.id])?.id
  const currentRef = useRef<HTMLLIElement | null>(null)

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentId])

  const done = steps.filter((s) => progress[s.id]).length

  return (
    <section className="practice">
      <header className="practice-bar">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Home
        </button>
        <div className="practice-bar-mid">
          <strong>{DAY_LABELS[day]}</strong>
          <span>
            {done}/{steps.length} · {formatDuration(totalDurationSec(steps))}
          </span>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onMarkDone}>
          {isComplete ? 'Done ✓' : 'Mark done'}
        </button>
      </header>

      {currentId && !guidedActive && (
        <p className="now-playing">
          Now:{' '}
          <strong>{steps.find((s) => s.id === currentId)?.name}</strong>
        </p>
      )}

      {groups.map((group) => (
        <div key={`${group.category}-${group.steps[0]?.id}`} className="cat-block">
          <h2 className="cat-title">{CATEGORY_LABELS[group.category]}</h2>
          <ul className="step-list">
            {group.steps.map((step) => {
              const checked = !!progress[step.id]
              const isCurrent = step.id === currentId
              return (
                <li
                  key={step.id}
                  ref={isCurrent ? currentRef : undefined}
                  className={[
                    'step',
                    checked ? 'step-done' : '',
                    isCurrent ? 'step-current' : '',
                    guidedActive && isCurrent ? 'step-guided' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <button
                    type="button"
                    className="step-check"
                    aria-pressed={checked}
                    aria-label={`${checked ? 'Uncheck' : 'Check'} ${step.name}`}
                    onClick={() => {
                      if (!guidedActive) onToggle(step.id)
                    }}
                    disabled={guidedActive}
                  >
                    <span className="check-mark">{checked ? '✓' : ''}</span>
                  </button>
                  <div className="step-body">
                    <div className="step-head">
                      <h3>{step.name}</h3>
                      <span className="step-dose">{formatDose(step)}</span>
                    </div>
                    <p className="step-cue">{step.cue}</p>
                    {step.rounds != null && (
                      <div className="rounds">
                        <span>
                          Round {Math.min(rounds, step.rounds)}/{step.rounds}
                        </span>
                        <div className="rounds-actions">
                          <button
                            type="button"
                            className="btn btn-small"
                            disabled={rounds <= 0}
                            onClick={() => onRounds(Math.max(0, rounds - 1))}
                          >
                            −
                          </button>
                          <button
                            type="button"
                            className="btn btn-small"
                            disabled={rounds >= step.rounds}
                            onClick={() => onRounds(Math.min(step.rounds!, rounds + 1))}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
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
