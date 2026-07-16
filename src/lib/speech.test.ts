import { describe, expect, it } from 'vitest'
import type { PracticeStep } from './types'
import { buildActivityAnnouncement, buildResumeAnnouncement } from './speech'

const step: PracticeStep = {
  id: 'high-knees',
  category: 'core',
  name: 'High Knees',
  sets: 1,
  reps: 30,
  durationSec: 60,
  cue: 'Keep breathing.',
}

describe('speech copy', () => {
  it('announces only the activity title and available time', () => {
    expect(buildActivityAnnouncement(step)).toBe('High Knees. 60 seconds.')
  })

  it('announces remaining resume time', () => {
    expect(buildResumeAnnouncement(step, 12_400)).toBe(
      'High Knees. Resume with 13 seconds remaining.',
    )
  })
})
