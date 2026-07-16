import { getActivityBenefit } from '../data/activityBenefits'
import type { PracticeStep } from '../lib/types'

type Props = {
  step: PracticeStep
}

export function ActivityBenefitCard({ step }: Props) {
  const benefit = getActivityBenefit(step)
  return (
    <aside className="benefit-card" aria-label={`Target areas for ${step.name}`}>
      <span className="eyebrow">Target areas</span>
      <h2>{benefit.primary}</h2>
      <div className="benefit-tags">
        {benefit.secondary.map((target) => (
          <span key={target}>{target}</span>
        ))}
      </div>
      <p>General exercise targets · not medical advice</p>
    </aside>
  )
}
