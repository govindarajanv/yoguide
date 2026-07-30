import { describe, expect, it } from 'vitest'
import {
  diffVsYesterday,
  planForDay,
  previousDay,
  totalDurationSec,
  trackForDay,
} from './schedule'

describe('planForDay', () => {
  it('builds 49 steps totaling 2820 seconds', () => {
    const plan = planForDay('mon')
    expect(plan).toHaveLength(49)
    expect(totalDurationSec(plan)).toBe(2820)
  })

  it('uses MWF core track on Monday', () => {
    const plan = planForDay('mon')
    expect(trackForDay('mon')).toBe('mwf')
    expect(plan.find((s) => s.id === 'core-1')?.name).toBe('High Knees')
    expect(plan.find((s) => s.id === 'core-5')?.name).toBe('Planks')
    expect(plan.find((s) => s.id === 'core-6')?.name).toBe('Crescent Low Lunge')
    expect(plan.find((s) => s.id === 'core-8')?.name).toBe('Leg Swings')
  })

  it('uses the Sun/Tue/Thu/Sat core track on all four days', () => {
    for (const day of ['sun', 'tue', 'thu', 'sat'] as const) {
      const plan = planForDay(day)
      expect(trackForDay(day)).toBe('stts')
      expect(plan.find((s) => s.id === 'core-1')?.name).toBe('Dead Bug')
      expect(plan.find((s) => s.id === 'core-5')?.name).toBe('Vrikshasana')
      expect(plan.find((s) => s.id === 'core-6')?.name).toBe('Side Lunge')
      expect(plan.find((s) => s.id === 'core-8')?.name).toBe('Mountain Climbers')
    }
  })

  it('names the mid-session relaxation per the sheet', () => {
    expect(planForDay('sun').find((s) => s.id === 'sukhasana')?.name).toBe('Relaxation')
    expect(planForDay('mon').find((s) => s.id === 'sukhasana')?.name).toBe('Sukhasana')
    expect(planForDay('tue').find((s) => s.id === 'sukhasana')?.name).toBe('Sukhasana')
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

  it('has no core diff between Saturday and Sunday (same track)', () => {
    const diffs = diffVsYesterday('sun')
    expect(diffs.some((d) => d.category === 'core')).toBe(false)
  })
})
