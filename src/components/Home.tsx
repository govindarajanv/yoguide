import { useState } from 'react'
import type { DayId, PracticeStep } from '../lib/types'
import type { GuidedStatus } from '../hooks/guidedSessionReducer'
import type { Theme } from '../hooks/useTheme'
import type { DayBenefits } from '../lib/dayBenefits'
import { formatClock } from '../lib/time'
import version from '../../VERSION?raw'
import { ThemeToggle } from './ThemeToggle'
import { BlocksIcon } from './BlocksIcon'
import { PickSessionDialog } from './PickSessionDialog'
import { MuscleMap } from './MuscleMap'
import {
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
  dayBenefits: DayBenefits
  checked: number
  totalSteps: number
  practiceSteps: PracticeStep[]
  guidedStatus: GuidedStatus
  guidedElapsedMs: number
  guidedCalories: number
  travelMode: boolean
  onToggleTravelMode: () => void
  onStartGuided: () => void
  onStartFrom: (index: number) => void
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
  dayBenefits,
  checked,
  totalSteps,
  practiceSteps,
  guidedStatus,
  guidedElapsedMs,
  guidedCalories,
  travelMode,
  onToggleTravelMode,
  onStartGuided,
  onStartFrom,
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
  const guidedRunning = ['announcing', 'running', 'stop-confirmation'].includes(guidedStatus)
  const guidedResumable = guidedStatus === 'paused' || guidedStatus === 'saved'
  const guidedComplete = guidedStatus === 'completed'
  const [pickOpen, setPickOpen] = useState(false)
  const canPick = guidedStatus === 'idle' || guidedStatus === 'completed'

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
            aria-label="Toggle chair mode"
            className={`travel-toggle ${travelMode ? 'travel-toggle-active' : ''}`}
            onClick={onToggleTravelMode}
            title={travelMode ? 'Turn chair mode off' : 'Turn chair mode on (Chair Yoga)'}
          >
            <span className="travel-toggle-icon">🧘</span>
            <span className="travel-toggle-label">Chair mode</span>
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
          <span className="week-badge">{travelMode ? 'CHAIR MODE' : 'PERSONAL PRACTICE'}</span>
        </div>
      </header>
      <div className="home-heading">
        <BlocksIcon count={blockCount} />
        <h1 className="home-title">
          {travelMode ? 'Chair Yoga' : DAY_LABELS[day]}
          <span className="home-track">
            {travelMode ? 'Chair Yoga · 20 min' : trackLabel(track)}
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

        <div className="hero-actions">
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
          <button
            type="button"
            className="btn btn-ghost hero-pick"
            onClick={() => setPickOpen(true)}
            disabled={!canPick || practiceSteps.length === 0}
          >
            Pick your session
          </button>
        </div>
      </section>

      <PickSessionDialog
        open={pickOpen}
        steps={practiceSteps}
        onPick={(index) => {
          setPickOpen(false)
          onStartFrom(index)
        }}
        onClose={() => setPickOpen(false)}
      />

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

      <section className="benefits-block">
        <h2>Muscle groups covered today</h2>
        <MuscleMap steps={practiceSteps} />

        <h2 className="benefits-title-2">Benefits if you complete today's practice</h2>
        <p className="benefits-metabolic">
          Estimated metabolic burn <strong>{dayBenefits.calories.toFixed(0)} kcal</strong> over{' '}
          {formatDuration(totalSec).replace('~', '')}.
        </p>
        <ul className="benefits-list">
          {dayBenefits.physiology.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      </section>

      <p className="equip">{travelMode ? 'Chair · comfortable clothes' : 'Mat · wall · towel'}</p>
    </section>
  )
}
