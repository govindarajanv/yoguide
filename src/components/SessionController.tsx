import type { GuidedStatus } from '../hooks/guidedSessionReducer'
import { formatClock } from '../lib/time'

type Props = {
  activityName: string
  activityIndex: number
  totalActivities: number
  remainingMs: number
  elapsedMs: number
  calories: number
  status: GuidedStatus
  speechAvailable: boolean
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

export function SessionController({
  activityName,
  activityIndex,
  totalActivities,
  remainingMs,
  elapsedMs,
  calories,
  status,
  speechAvailable,
  onPause,
  onResume,
  onStop,
}: Props) {
  const paused = status === 'paused' || status === 'saved'
  return (
    <aside className="session-controller" aria-label="Guided session controls">
      <div className="controller-current">
        <span className="eyebrow">
          Current · {Math.min(activityIndex + 1, totalActivities)} of {totalActivities}
        </span>
        <strong>{activityName}</strong>
        {!speechAvailable && <span className="voice-status">Voice unavailable</span>}
      </div>
      <div className="controller-timer" aria-label="Activity time remaining">
        {formatClock(remainingMs)}
      </div>
      <div className="controller-metric">
        <span>Elapsed</span>
        <strong>{formatClock(elapsedMs)}</strong>
      </div>
      <div className="controller-actions">
        {paused ? (
          <button type="button" className="control-primary" onClick={onResume} aria-label="Resume session">
            ▶ <span>Resume</span>
          </button>
        ) : (
          <button type="button" className="control-primary" onClick={onPause} aria-label="Pause session">
            Ⅱ <span>Pause</span>
          </button>
        )}
        <button type="button" className="control-stop" onClick={onStop} aria-label="Stop session">
          ■ <span>Stop</span>
        </button>
      </div>
      <div className="controller-metric controller-calories">
        <span>Estimated</span>
        <strong>{calories.toFixed(1)} kcal</strong>
      </div>
    </aside>
  )
}
