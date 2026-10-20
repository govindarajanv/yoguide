import { useMemo, useState, type ReactElement } from 'react'
import { getActivityBenefit } from '../data/activityBenefits'
import type { PracticeStep } from '../lib/types'

type View = 'front' | 'back'

const KEYWORDS: Record<string, string[]> = {
  head: ['head', 'neck', 'face', 'jaw', 'eye', 'tongue', 'throat'],
  shoulders: ['shoulder', 'rotator cuff', 'deltoid', 'trapezius', 'upper back'],
  arms: ['arm', 'tricep', 'bicep', 'forearm', 'elbow'],
  hands: ['hand', 'finger', 'thumb', 'wrist'],
  chest: ['chest', 'rib', 'diaphragm', 'breath', 'posture'],
  core: ['core', 'obli', 'abdom', 'side body', 'waist'],
  hips: ['hip', 'pelvis', 'outer hip', 'pelvic'],
  frontThighs: ['quadriceps', 'quad', 'front thigh', 'thigh', 'adductor', 'inner thigh', 'hip flexor'],
  shins: ['shin', 'tibialis'],
  feet: ['foot', 'ankle', 'toe', 'heel'],
  upperBack: ['upper back', 'trapezius', 'rhomboid', 'rear deltoid', 'shoulder'],
  lowerBack: ['lower back', 'spine', 'spinal', 'erector', 'sciatic'],
  glutes: ['glute', 'outer hip', 'pelvis', 'hip'],
  backThighs: ['hamstring', 'back thigh', 'thigh'],
  calves: ['calf', 'achilles', 'shin'],
}

const LABELS: Record<string, string> = {
  head: 'Head & neck',
  shoulders: 'Shoulders',
  arms: 'Arms',
  hands: 'Hands',
  chest: 'Chest & breath',
  core: 'Core & abs',
  hips: 'Hips',
  frontThighs: 'Front thighs',
  shins: 'Shins',
  feet: 'Feet & ankles',
  upperBack: 'Upper back',
  lowerBack: 'Lower back',
  glutes: 'Glutes',
  backThighs: 'Back of thighs',
  calves: 'Calves',
}

/** A fuller region list on the figure so labels stay readable on the preferred side. */
const FRONT: Array<{ id: string; el: ReactElement }> = [
  { id: 'head', el: <ellipse cx="100" cy="30" rx="21" ry="24" /> },
  { id: 'shoulders', el: <ellipse cx="100" cy="92" rx="52" ry="22" /> },
  { id: 'arms', el: <rect x="50" y="96" width="16" height="78" rx="8" /> },
  { id: 'arms', el: <rect x="134" y="96" width="16" height="78" rx="8" /> },
  { id: 'hands', el: <circle cx="58" cy="180" r="8" /> },
  { id: 'hands', el: <circle cx="142" cy="180" r="8" /> },
  { id: 'chest', el: <ellipse cx="100" cy="128" rx="33" ry="26" /> },
  { id: 'core', el: <ellipse cx="100" cy="160" rx="24" ry="20" /> },
  { id: 'hips', el: <ellipse cx="100" cy="194" rx="32" ry="16" /> },
  { id: 'frontThighs', el: <rect x="81" y="206" width="20" height="60" rx="10" /> },
  { id: 'frontThighs', el: <rect x="99" y="206" width="20" height="60" rx="10" /> },
  { id: 'shins', el: <rect x="83" y="272" width="17" height="44" rx="8" /> },
  { id: 'shins', el: <rect x="100" y="272" width="17" height="44" rx="8" /> },
  { id: 'feet', el: <ellipse cx="91" cy="326" rx="18" ry="8" /> },
  { id: 'feet', el: <ellipse cx="109" cy="326" rx="18" ry="8" /> },
]

const BACK: Array<{ id: string; el: ReactElement }> = [
  { id: 'head', el: <ellipse cx="100" cy="30" rx="21" ry="24" /> },
  { id: 'upperBack', el: <ellipse cx="100" cy="96" rx="42" ry="30" /> },
  { id: 'arms', el: <rect x="50" y="96" width="16" height="78" rx="8" /> },
  { id: 'arms', el: <rect x="134" y="96" width="16" height="78" rx="8" /> },
  { id: 'hands', el: <circle cx="58" cy="180" r="8" /> },
  { id: 'hands', el: <circle cx="142" cy="180" r="8" /> },
  { id: 'lowerBack', el: <ellipse cx="100" cy="140" rx="28" ry="24" /> },
  { id: 'glutes', el: <ellipse cx="100" cy="188" rx="34" ry="18" /> },
  { id: 'backThighs', el: <rect x="81" y="202" width="20" height="56" rx="10" /> },
  { id: 'backThighs', el: <rect x="99" y="202" width="20" height="56" rx="10" /> },
  { id: 'calves', el: <rect x="83" y="262" width="18" height="50" rx="9" /> },
  { id: 'calves', el: <rect x="99" y="262" width="18" height="50" rx="9" /> },
  { id: 'feet', el: <ellipse cx="91" cy="322" rx="18" ry="8" /> },
  { id: 'feet', el: <ellipse cx="109" cy="322" rx="18" ry="8" /> },
]

const ALL_IDS = Object.keys(KEYWORDS)

function isFullBody(muscle: string): boolean {
  return /full body|whole-body|whole body|cardiovascular|circulation/.test(muscle.toLowerCase())
}

function regionIdsForMuscle(muscle: string): string[] {
  if (isFullBody(muscle)) return ALL_IDS
  const lower = muscle.toLowerCase()
  return ALL_IDS.filter((id) => KEYWORDS[id].some((k) => lower.includes(k)))
}

/**
 * Map every body region to the list of activity names that cover it for the day.
 * Uses each activity's curated muscle benefit (primary + secondary targets).
 */
function buildRegionActivities(steps: PracticeStep[]): Record<string, Set<string>> {
  const map: Record<string, Set<string>> = {}
  for (const step of steps) {
    const benefit = getActivityBenefit(step)
    for (const target of [benefit.primary, ...benefit.secondary]) {
      for (const id of regionIdsForMuscle(target)) {
        if (!map[id]) map[id] = new Set()
        map[id].add(step.name)
      }
    }
  }
  return map
}

export function MuscleMap({ steps }: { steps: PracticeStep[] }) {
  const [view, setView] = useState<View>('front')

  const regionActivities = useMemo(() => buildRegionActivities(steps), [steps])
  const active = useMemo(() => {
    const set = new Set<string>()
    for (const id of ALL_IDS) if (regionActivities[id] && regionActivities[id].size > 0) set.add(id)
    return set
  }, [regionActivities])

  const regions = view === 'front' ? FRONT : BACK
  const panelIds = [...new Set(regions.map((r) => r.id))]
    .filter((id) => active.has(id))
    .sort((a, b) => LABELS[a].localeCompare(LABELS[b]))

  return (
    <div className="muscle-map">
      <div className="muscle-map-head">
        <div className="muscle-map-tabs" role="tablist" aria-label="Body view">
          {(['front', 'back'] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              className={`muscle-map-tab ${view === v ? 'active' : ''}`}
              onClick={() => setView(v)}
            >
              {v === 'front' ? 'Front' : 'Back'}
            </button>
          ))}
        </div>
      </div>

      <div className="muscle-map-body">
        <div className="muscle-map-figure">
          <svg
            viewBox="0 0 200 342"
            role="img"
            aria-label={`Body map highlighting ${active.size} covered muscle regions`}
            className="muscle-map-svg"
          >
            {regions.map((region, i) => (
              <g
                key={`${region.id}-${i}`}
                className={`muscle-part ${active.has(region.id) ? 'active' : ''}`}
              >
                {region.el}
              </g>
            ))}
          </svg>
        </div>

        <div className="muscle-map-panel">
          {panelIds.length > 0 ? (
            panelIds.map((id) => (
              <div key={id} className="muscle-region-card">
                <h3 className="muscle-region-title">
                  <i className="muscle-legend-dot" aria-hidden="true" />
                  {LABELS[id]}
                </h3>
                <ul className="muscle-region-activities">
                  {[...regionActivities[id]].map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="muscle-legend-empty">No body regions highlighted this day.</p>
          )}
        </div>
      </div>
    </div>
  )
}
