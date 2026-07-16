import { describe, expect, it } from 'vitest'
import { DAY_IDS, planForDay } from '../lib/schedule'
import { hasCuratedActivityBenefit } from './activityBenefits'

describe('activity benefits', () => {
  it('has curated target data for every activity across all day tracks', () => {
    const missing = DAY_IDS.flatMap(planForDay)
      .map((step) => step.name)
      .filter((name, index, names) => names.indexOf(name) === index)
      .filter((name) => !hasCuratedActivityBenefit(name))
    expect(missing).toEqual([])
  })
})
