import { formatClock } from '../lib/time'
import type { CategorySummary } from '../lib/sessionAnalytics'
import { SessionCharts } from './SessionCharts'

type Props = {
  status: 'saved' | 'completed'
  elapsedMs: number
  calories: number
  completedCount: number
  totalCount: number
  summaries: CategorySummary[]
  onResume: () => void
  onStartOver: () => void
}

export function SessionSummary({
  status,
  elapsedMs,
  calories,
  completedCount,
  totalCount,
  summaries,
  onResume,
  onStartOver,
}: Props) {
  return (
    <section className="session-summary">
      <span className="eyebrow">{status === 'completed' ? 'Practice complete' : 'Session saved'}</span>
      <h2>{status === 'completed' ? 'Strong work.' : 'Your place is saved.'}</h2>
      <div className="summary-metrics">
        <div><span>Active time</span><strong>{formatClock(elapsedMs)}</strong></div>
        <div><span>Estimated burn</span><strong>{calories.toFixed(1)} kcal</strong></div>
        <div><span>Activities</span><strong>{completedCount}/{totalCount}</strong></div>
      </div>
      {status === 'completed' && <SessionCharts summaries={summaries} />}
      <div className="summary-actions">
        {status === 'saved' && (
          <button type="button" className="btn btn-primary" onClick={onResume}>
            Resume session
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={onStartOver}>
          Start over
        </button>
      </div>
    </section>
  )
}
