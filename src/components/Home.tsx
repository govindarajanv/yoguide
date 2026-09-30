import type { DayDiff, DayId } from '../lib/types'
import type { GuidedStatus } from '../hooks/guidedSessionReducer'
import type { Theme } from '../hooks/useTheme'
import { formatClock } from '../lib/time'
import version from '../../VERSION?raw'
import { ThemeToggle } from './ThemeToggle'
import { BlocksIcon } from './BlocksIcon'
import {
  CATEGORY_LABELS,
  DAY_IDS,
  DAY_LABELS,
  blocksForDay,
  formatDuration,
  trackForDay,
  trackLabel,
} from '../lib/schedule'

type Props = {
  day: DayId
  today: DayId
  onSelectDay: (day: DayId) => void
  totalSec: number
  diffs: DayDiff[]
  checked: number
  totalSteps: number
  guidedStatus: GuidedStatus
  guidedElapsedMs: number
  guidedCalories: number
  travelMode: boolean
  onToggleTravelMode: () => void
  onStartGuided: () => void
  onOpenGuided: () => void
  onResumeGuided: () => void
  onStart: () => void
  onOpenToday: () => void
  onOpenWeek: () => void
  theme: Theme
  onToggleTheme: () => void
}

export function Home({
  day,
  today,
  onSelectDay,
  totalSec,
  diffs,
  checked,
  totalSteps,
  guidedStatus,
  guidedElapsedMs,
  guidedCalories,
  travelMode,
  onToggleTravelMode,
  onStartGuided,
  onOpenGuided,
  onResumeGuided,
  onStart,
  onOpenToday,
  onOpenWeek,
  theme,
  onToggleTheme,
}: Props) {
  const track = trackForDay(day)
  const blockCount = travelMode ? 2 : blocksForDay(day).length
  const coreDiffs = travelMode ? [] : diffs.filter((d) => d.category === 'core')
  const breathDiffs = travelMode ? [] : diffs.filter((d) => d.category === 'pranayama')
  const guidedRunning = ['announcing', 'running', 'stop-confirmation'].includes(guidedStatus)
  const guidedResumable = guidedStatus === 'paused' || guidedStatus === 'saved'
  const guidedComplete = guidedStatus === 'completed'

  return (
    <section className="home">
      <header className="home-masthead">
        <div className="brand-block">
          <p className="brand">YOGUIDE <span>— Your Yoga Guide</span></p>
          <span className="brand-version">{version.trim()}</span>
        </div>
        <div className="masthead-actions">
          <button
            type="button"
            role="switch"
            aria-checked={travelMode}
            aria-label="Toggle travel mode"
            className={`travel-toggle ${travelMode ? 'travel-toggle-active' : ''}`}
            onClick={onToggleTravelMode}
            title={travelMode ? 'Turn travel mode off' : 'Turn travel mode on (Chair Yoga)'}
          >
            <span className="travel-toggle-icon">✈️</span>
            <span className="travel-toggle-label">Travel mode</span>
            <span className={`travel-toggle-badge ${travelMode ? 'badge-on' : 'badge-off'}`}>
              {travelMode ? 'ON' : 'OFF'}
            </span>
          </button>
          {!travelMode && (
            <label className="day-select">
              <span className="day-select-label">Practice day</span>
              <select
                value={day}
                onChange={(event) => onSelectDay(event.target.value as DayId)}
                aria-label="Practice day"
              >
                {DAY_IDS.map((d) => (
                  <option key={d} value={d}>
                    {DAY_LABELS[d]}
                    {d === today ? ' (today)' : ''}
                  </option>
                ))}
              </select>
            </label>
          )}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <span className="week-badge">{travelMode ? 'TRAVEL MODE' : 'PERSONAL PRACTICE'}</span>
        </div>
      </header>
      <div className="home-heading">
        <BlocksIcon count={blockCount} />
        <h1 className="home-title">
          {travelMode ? 'Chair Yoga' : DAY_LABELS[day]}
          <span className="home-track">
            {travelMode ? 'Travel & Quick Practice · 20 min' : trackLabel(track)}
          </span>
        </h1>
      </div>
      <section className="guided-hero">
        <span className="eyebrow">Guided session</span>
        <h2>{guidedComplete ? 'Practice complete.' : 'Ready when you are.'}</h2>
        <p>Voice cues, automatic activity timing, and live calorie estimate.</p>

        <div className="hero-metrics">
          <div><span>Duration</span><strong>{formatDuration(totalSec).replace('~', '')}</strong></div>
          <div><span>Activities</span><strong>{totalSteps}</strong></div>
          <div><span>Elapsed</span><strong>{formatClock(guidedElapsedMs)}</strong></div>
          <div><span>Estimated burn</span><strong>{guidedCalories.toFixed(1)} kcal</strong></div>
        </div>

        <button
          type="button"
          className="btn btn-primary hero-play"
          onClick={
            guidedRunning ? onOpenGuided : guidedResumable ? onResumeGuided : onStartGuided
          }
          disabled={guidedComplete}
        >
          <span className="play-icon">▶</span>
          {guidedRunning
            ? 'Return to session'
            : guidedResumable
              ? 'Resume guided session'
              : guidedComplete
                ? 'Completed'
                : 'Start guided session'}
        </button>
      </section>

      <p className="home-meta">{checked}/{totalSteps} activities complete</p>

      <div className="cta-row">
        <button type="button" className="btn btn-ghost" onClick={onStart}>
          Manual practice
        </button>
        <button type="button" className="btn btn-ghost" onClick={onOpenToday}>
          {travelMode ? 'Chair Yoga activities' : "Today's activities"}
        </button>
        {!travelMode && (
          <button type="button" className="btn btn-ghost" onClick={onOpenWeek}>
            Week
          </button>
        )}
      </div>

      {(coreDiffs.length > 0 || breathDiffs.length > 0) && (
        <div className="diff-block">
          <h2>Different vs yesterday</h2>
          {coreDiffs.length > 0 && (
            <div className="diff-group">
              <h3>{CATEGORY_LABELS.core}</h3>
              <ul>
                {coreDiffs.map((d) => (
                  <li key={d.stepId}>
                    <strong>{d.todayName}</strong>
                    <span className="diff-was">was {d.yesterdayName}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {breathDiffs.length > 0 && (
            <div className="diff-group">
              <h3>{CATEGORY_LABELS.pranayama}</h3>
              <ul>
                {breathDiffs.map((d) => (
                  <li key={d.stepId}>
                    <strong>{d.todayName}</strong>
                    <span className="diff-was">was {d.yesterdayName}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="equip">{travelMode ? 'Chair · comfortable clothes' : 'Mat · wall · towel'}</p>
    </section>
  )
}
