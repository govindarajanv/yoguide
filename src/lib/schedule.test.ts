import { describe, expect, it } from 'vitest'
import {
  blocksForChairYoga,
  blocksForDay,
  chairYogaPlan,
  diffVsYesterday,
  planForDay,
  previousDay,
  totalDurationSec,
  trackForDay,
} from './schedule'

describe('planForDay', () => {
  it('builds 49 steps totaling 2400 seconds', () => {
    const plan = planForDay('mon')
    expect(plan).toHaveLength(49)
    expect(totalDurationSec(plan)).toBe(2400)
  })

  it('uses the Sun/Tue/Thu/Sat core track', () => {
    for (const day of ['sun', 'tue', 'thu', 'sat'] as const) {
      const plan = planForDay(day)
      expect(trackForDay(day)).toBe('sta')
      expect(plan.find((s) => s.id === 'core-1')?.name).toBe('Dead Bug')
      expect(plan.find((s) => s.id === 'core-5')?.name).toBe('Vrikshasana')
      expect(plan.find((s) => s.id === 'core-6')?.name).toBe('Side Lunge')
      expect(plan.find((s) => s.id === 'core-8')?.name).toBe('Mountain Climbers')
    }
  })

  it('uses the Mon/Wed/Fri core track', () => {
    for (const day of ['mon', 'wed', 'fri'] as const) {
      const plan = planForDay(day)
      expect(trackForDay(day)).toBe('mwf')
      expect(plan.find((s) => s.id === 'core-1')?.name).toBe('High Knees')
      expect(plan.find((s) => s.id === 'core-5')?.name).toBe('Planks')
      expect(plan.find((s) => s.id === 'core-6')?.name).toBe('Crescent Low Lunge')
      expect(plan.find((s) => s.id === 'core-8')?.name).toBe('Leg Swings')
    }
  })

  it('names the mid-session relaxation per the sheet', () => {
    expect(planForDay('sun').find((s) => s.id === 'sukhasana')?.name).toBe('Sukhasana')
    expect(planForDay('mon').find((s) => s.id === 'sukhasana')?.name).toBe('Sukhasana')
    expect(planForDay('tue').find((s) => s.id === 'sukhasana')?.name).toBe('Sukhasana')
  })

  it('rotates pranayama by day', () => {
    expect(planForDay('sun').find((s) => s.id === 'sectional-breath')?.name).toBe(
      'Abdominal Breath -CN/U',
    )
    expect(planForDay('mon').find((s) => s.id === 'cooling-breath')?.name).toBe('Seethkari')
    expect(planForDay('tue').find((s) => s.id === 'humming-breath')?.name).toBe('Brahmari')
    expect(planForDay('fri').find((s) => s.id === 'sectional-breath')?.name).toBe(
      'Shoulder Breath - AM/U',
    )
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

describe('blocksForDay', () => {
  it('splits Sun/Tue/Thu/Sat into two blocks at Savasana', () => {
    for (const day of ['sun', 'tue', 'thu', 'sat'] as const) {
      const blocks = blocksForDay(day)
      expect(blocks).toHaveLength(2)
      expect(blocks[0]?.label).toBe('Block 1')
      expect(blocks[1]?.label).toBe('Block 2')
      expect(blocks[0]?.steps.at(-1)?.id).toBe('savasana')
      expect(blocks[1]?.steps[0]?.id).toBe('hand-stretches')
    }
  })

  it('keeps Mon/Wed/Fri as a single block with the full day', () => {
    for (const day of ['mon', 'wed', 'fri'] as const) {
      const blocks = blocksForDay(day)
      expect(blocks).toHaveLength(1)
      expect(blocks[0]?.steps).toHaveLength(49)
      expect(totalDurationSec(blocks[0]!.steps)).toBe(2400)
    }
  })
})

describe('chairYogaPlan', () => {
  it('builds exactly 31 steps totaling 1200 seconds (20 minutes)', () => {
    const plan = chairYogaPlan()
    expect(plan).toHaveLength(31)
    expect(totalDurationSec(plan)).toBe(1200)
  })

  it('includes Surya Namaskar with 240s duration and 30s ding interval', () => {
    const plan = chairYogaPlan()
    const sn = plan.find((s) => s.id === 'chair-surya-namaskar')
    expect(sn).toBeDefined()
    expect(sn?.durationSec).toBe(240)
    expect(sn?.dingIntervalSec).toBe(30)
    expect(sn?.finalWarningSec).toBe(30)
  })

  it('splits into 2 blocks at chair-savasana', () => {
    const blocks = blocksForChairYoga()
    expect(blocks).toHaveLength(2)
    expect(blocks[0]?.label).toBe('Block 1')
    expect(blocks[0]?.name).toBe('Practice')
    expect(blocks[0]?.steps.at(-1)?.id).toBe('chair-savasana')
    expect(blocks[1]?.label).toBe('Block 2')
    expect(blocks[1]?.name).toBe('Wind-down')
    expect(blocks[1]?.steps[0]?.id).toBe('chair-hand-stretching')
    expect(totalDurationSec(blocks[0]!.steps) + totalDurationSec(blocks[1]!.steps)).toBe(1200)
  })
})

