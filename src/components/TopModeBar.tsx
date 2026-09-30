type Props = {
  travelMode: boolean
  onToggleTravelMode: () => void
}

export function TopModeBar({ travelMode, onToggleTravelMode }: Props) {
  return (
    <nav className="top-mode-bar" aria-label="Practice Mode Navigation">
      <div className="mode-selector-tabs">
        <button
          type="button"
          className={`mode-tab ${!travelMode ? 'mode-tab-active' : ''}`}
          onClick={() => {
            if (travelMode) onToggleTravelMode()
          }}
          aria-current={!travelMode ? 'page' : undefined}
        >
          <span className="mode-tab-icon">🧘</span>
          <span className="mode-tab-label">Regular Yoga</span>
          <span className="mode-tab-badge">40 min</span>
        </button>
        <button
          type="button"
          className={`mode-tab ${travelMode ? 'mode-tab-active' : ''}`}
          onClick={() => {
            if (!travelMode) onToggleTravelMode()
          }}
          aria-current={travelMode ? 'page' : undefined}
        >
          <span className="mode-tab-icon">🪑</span>
          <span className="mode-tab-label">Chair Yoga</span>
          <span className="mode-tab-badge">Travel · 20 min</span>
        </button>
      </div>

      <div className="mode-toggle-group">
        <label className="toggle-switch-label" title="Toggle travel mode">
          <span className="toggle-switch-text">Travel mode</span>
          <div className="switch-wrapper">
            <input
              type="checkbox"
              role="switch"
              checked={travelMode}
              onChange={onToggleTravelMode}
              aria-label="Toggle Chair Yoga travel mode"
            />
            <span className="switch-slider"></span>
          </div>
          <span className={`toggle-status-tag ${travelMode ? 'status-on' : 'status-off'}`}>
            {travelMode ? 'ON' : 'OFF'}
          </span>
        </label>
      </div>
    </nav>
  )
}
