import type { CategorySummary } from '../lib/sessionAnalytics'

type Props = {
  summaries: CategorySummary[]
}

type ChartProps = {
  title: string
  summaries: CategorySummary[]
  value: (summary: CategorySummary) => number
  format: (value: number) => string
}

function BarChart({ title, summaries, value, format }: ChartProps) {
  const max = Math.max(...summaries.map(value), 1)
  return (
    <section className="summary-chart" aria-label={title}>
      <h3>{title}</h3>
      <div className="chart-rows">
        {summaries.map((summary) => {
          const amount = value(summary)
          return (
            <div className="chart-row" key={summary.category}>
              <div className="chart-label">
                <span>{summary.label}</span>
                <strong>{format(amount)}</strong>
              </div>
              <div
                className="chart-track"
                role="img"
                aria-label={`${summary.label}: ${format(amount)}`}
              >
                <span style={{ width: `${Math.max(2, (amount / max) * 100)}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function SessionCharts({ summaries }: Props) {
  if (summaries.length === 0) return null
  return (
    <div className="session-charts">
      <BarChart
        title="Active time by section"
        summaries={summaries}
        value={(summary) => summary.elapsedMs}
        format={(value) => `${(value / 60_000).toFixed(1)} min`}
      />
      <BarChart
        title="Estimated calories by section"
        summaries={summaries}
        value={(summary) => summary.calories}
        format={(value) => `${value.toFixed(1)} kcal`}
      />
    </div>
  )
}
