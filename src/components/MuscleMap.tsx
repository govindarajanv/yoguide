import { useMemo } from 'react'
import { getActivityBenefit } from '../data/activityBenefits'
import type { PracticeStep } from '../lib/types'

const KEYWORDS: Record<string, string[]> = {
  head: ['head', 'neck', 'face', 'jaw', 'eye', 'tongue', 'throat'],
  shoulders: ['shoulder', 'rotator cuff', 'deltoid', 'trapezius', 'upper back'],
  arms: ['arm', 'tricep', 'bicep', 'forearm', 'elbow'],
  hands: ['hand', 'finger', 'thumb', 'wrist'],
  chest: ['chest', 'rib', 'diaphragm', 'breath', 'posture'],
  core: ['core', 'obli', 'abdom', 'side body', 'waist'],
  hips: ['hip', 'pelvis', 'outer hip', 'pelvic'],
  frontThighs: ['quadriceps', 'quad', 'thigh', 'adductor', 'inner thigh', 'hip flexor'],
  shins: ['shin', 'tibialis'],
  feet: ['foot', 'ankle', 'toe', 'heel'],
  upperBack: ['upper back', 'trapezius', 'rhomboid', 'rear deltoid', 'shoulder'],
  lowerBack: ['lower back', 'spine', 'spinal', 'erector', 'sciatic'],
  glutes: ['glute', 'outer hip', 'pelvis', 'hip'],
  backThighs: ['hamstring', 'thigh'],
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
  const regionActivities = useMemo(() => buildRegionActivities(steps), [steps])

  const entries = ALL_IDS.map((id) => ({
    id,
    label: LABELS[id],
    activities: regionActivities[id] ? [...regionActivities[id]] : [],
  }))
    .filter((entry) => entry.activities.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <div className="muscle-map">
      <div className="muscle-map-panel">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <div key={entry.id} className="muscle-region-card">
              <h3 className="muscle-region-title">
                <i className="muscle-legend-dot" aria-hidden="true" />
                {entry.label} <span className="muscle-region-count">({entry.activities.length})</span>
              </h3>
              <ul className="muscle-region-activities">
                {entry.activities.map((name) => (
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
  )
}
