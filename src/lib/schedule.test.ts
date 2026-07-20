import { describe, expect, it } from 'vitest'
import {
  diffVsYesterday,
  planForDay,
  previousDay,
  totalDurationSec,
  trackForDay,
} from './schedule'

describe('planForDay', () => {
  it('builds 43 steps totaling 2680 seconds', () => {
    const plan = planForDay('mon')
    expect(plan).toHaveLength(43)
    expect(totalDurationSec(plan)).toBe(2680)
  })

  it('uses MWF core track on Monday', () => {
    const plan = planForDay('mon')
    expect(trackForDay('mon')).toBe('mwf')
    expect(plan.find((s) => s.id === 'core-1')?.name).toBe('High Knees')
    expect(plan.find((s) => s.id === 'core-5')?.name).toBe('Planks')
  })

  it('uses Sunday core track', () => {
    const plan = planForDay('sun')
    expect(plan.find((s) => s.id === 'core-1')?.name).toBe('Dead Bug')
    expect(plan.find((s) => s.id === 'core-5')?.name).toBe('Vrikshasana')
  })

  it('rotates pranayama by day', () => {
    expect(planForDay('sun').find((s) => s.id === 'sectional-breath')?.name).toBe(
      'Abdominal Breath -CN/U',
    )
    expect(planForDay('mon').find((s) => s.id === 'cooling-breath')?.name).toBe('Seethkari')
    expect(planForDay('fri').find((s) => s.id === 'humming-breath')?.name).toBe('AUM BM')
  })
})

describe('diffVsYesterday', () => {
  it('highlights Monday changes from Sunday', () => {
    expect(previousDay('mon')).toBe('sun')
    const diffs = diffVsYesterday('mon')
    expect(diffs.some((d) => d.todayName === 'High Knees' && d.yesterdayName === 'Dead Bug')).toBe(
      true,
    )
    expect(diffs.some((d) => d.category === 'pranayama')).toBe(true)
  })
})
