import { useMemo, useState, type ReactElement } from 'react'

type View = 'front' | 'back'

const KEYWORDS: Record<string, string[]> = {
  head: ['head', 'neck', 'face', 'jaw', 'eye', 'tongue', 'throat'],
  shoulders: ['shoulder', 'rotator cuff', 'deltoid', 'trapezius', 'rear deltoid', 'upper back'],
  arms: ['arm', 'tricep', 'bicep', 'forearm', 'elbow'],
  hands: ['hand', 'finger', 'thumb', 'wrist'],
  chest: ['chest', 'rib', 'diaphragm', 'breath', 'posture'],
  core: ['core', 'obli', 'abdom', 'side body', 'waist'],
  hips: ['hip', 'pelvis', 'outer hip'],
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
  backThighs: 'Back thighs (hamstrings)',
  calves: 'Calves',
}

const FRONT: Array<{ id: string; el: ReactElement }> = [
  { id: 'head', el: <ellipse cx="100" cy="28" rx="22" ry="25" /> },
  { id: 'shoulders', el: <path d="M74 82 Q74 74 84 74 L116 74 Q126 74 126 82 L126 96 Q126 102 118 102 L82 102 Q74 102 74 96 Z" /> },
  { id: 'arms', el: <rect x="56" y="84" width="15" height="76" rx="7" /> },
  { id: 'arms', el: <rect x="129" y="84" width="15" height="76" rx="7" /> },
  { id: 'chest', el: <path d="M82 96 L118 96 Q124 96 124 104 L120 132 Q120 140 112 142 L88 142 Q80 140 80 132 L76 104 Q76 96 82 96 Z" /> },
  { id: 'core', el: <path d="M86 142 L114 142 Q120 142 120 150 L118 176 Q118 182 112 184 L88 184 Q82 182 82 176 L80 150 Q80 142 86 142 Z" /> },
  { id: 'hips', el: <path d="M80 184 L120 184 Q126 184 126 192 L124 204 Q124 210 116 210 L84 210 Q76 210 76 204 L74 192 Q74 184 80 184 Z" /> },
  { id: 'arms', el: <rect x="63" y="160" width="15" height="14" rx="7" /> },
  { id: 'hands', el: <circle cx="75" cy="178" r="8" /> },
  { id: 'hands', el: <circle cx="125" cy="178" r="8" /> },
  { id: 'frontThighs', el: <rect x="83" y="210" width="22" height="56" rx="10" /> },
  { id: 'frontThighs', el: <rect x="109" y="210" width="22" height="56" rx="10" /> },
  { id: 'shins', el: <rect x="85" y="270" width="20" height="40" rx="9" /> },
  { id: 'shins', el: <rect x="109" y="270" width="20" height="40" rx="9" /> },
  { id: 'feet', el: <ellipse cx="95" cy="320" rx="17" ry="8" /> },
  { id: 'feet', el: <ellipse cx="119" cy="320" rx="17" ry="8" /> },
]

const BACK: Array<{ id: string; el: ReactElement }> = [
  { id: 'head', el: <ellipse cx="100" cy="28" rx="22" ry="25" /> },
  { id: 'upperBack', el: <path d="M76 76 Q76 70 86 70 L114 70 Q124 70 124 76 L126 110 Q126 118 118 120 L82 120 Q74 118 74 110 Z" /> },
  { id: 'arms', el: <rect x="56" y="84" width="15" height="76" rx="7" /> },
  { id: 'arms', el: <rect x="129" y="84" width="15" height="76" rx="7" /> },
  { id: 'lowerBack', el: <path d="M82 120 L118 120 Q124 120 124 128 L122 156 Q122 162 114 164 L86 164 Q78 162 78 156 L76 128 Q76 120 82 120 Z" /> },
  { id: 'glutes', el: <path d="M78 164 L122 164 Q128 164 128 172 L126 192 Q126 198 116 200 L84 200 Q74 198 74 192 L72 172 Q72 164 78 164 Z" /> },
  { id: 'arms', el: <rect x="63" y="160" width="15" height="14" rx="7" /> },
  { id: 'hands', el: <circle cx="75" cy="178" r="8" /> },
  { id: 'hands', el: <circle cx="125" cy="178" r="8" /> },
  { id: 'backThighs', el: <rect x="83" y="200" width="22" height="52" rx="10" /> },
  { id: 'backThighs', el: <rect x="109" y="200" width="22" height="52" rx="10" /> },
  { id: 'calves', el: <rect x="84" y="256" width="21" height="46" rx="9" /> },
  { id: 'calves', el: <rect x="109" y="256" width="21" height="46" rx="9" /> },
  { id: 'feet', el: <ellipse cx="95" cy="314" rx="17" ry="8" /> },
  { id: 'feet', el: <ellipse cx="119" cy="314" rx="17" ry="8" /> },
]

function activeSet(muscles: string[]): Set<string> {
  const lower = muscles.map((m) => m.toLowerCase())
  const fullBody = lower.some((m) =>
    /full body|whole-body|whole body|cardiovascular|circulation/.test(m),
  )
  const active = new Set<string>()
  if (fullBody) {
    for (const id of Object.keys(KEYWORDS)) active.add(id)
    return active
  }
  for (const [id, kw] of Object.entries(KEYWORDS)) {
    if (lower.some((m) => kw.some((k) => m.includes(k)))) active.add(id)
  }
  return active
}

export function MuscleMap({ muscles }: { muscles: string[] }) {
  const [view, setView] = useState<View>('front')
  const active = useMemo(() => activeSet(muscles), [muscles])
  const regions = view === 'front' ? FRONT : BACK

  const legend = [...new Set(regions.map((r) => r.id))]
    .map((id) => ({ id, label: LABELS[id] }))
    .filter((r) => active.has(r.id))

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
        <svg
          viewBox="0 0 200 340"
          role="img"
          aria-label={`Body map highlighting ${legend.length} covered muscle regions`}
          className="muscle-map-svg"
        >
          {regions.map((region, i) => (
            <g key={`${region.id}-${i}`} className={`muscle-part ${active.has(region.id) ? 'active' : ''}`}>
              {region.el}
            </g>
          ))}
        </svg>

        <div className="muscle-map-legend">
          {legend.length > 0 ? (
            legend.map((r) => (
              <span key={r.id} className="muscle-legend-item">
                <i className="muscle-legend-dot" aria-hidden="true" />
                {r.label}
              </span>
            ))
          ) : (
            <span className="muscle-legend-empty">No body regions highlighted this day.</span>
          )}
        </div>
      </div>
    </div>
  )
}
