import version from '../../VERSION?raw'

export function Disclaimer() {
  return (
    <footer className="disclaimer">
      <p>
        <strong>Disclaimer:</strong> This website documents my personal exercise and yoga routines
        and is not intended as medical advice or a recommendation for others. Always consult your
        physician, orthopedist, physiotherapist, or other qualified healthcare professional before
        starting or modifying any exercise, yoga, stretching, or wellness program. Participation in
        physical activity is at your own risk.
      </p>
      <p className="disclaimer-version">YOGUIDE {version.trim()}</p>
    </footer>
  )
}
