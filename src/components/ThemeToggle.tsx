import type { Theme } from '../hooks/useTheme'

type Props = {
  theme: Theme
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
    >
      <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
    </button>
  )
}
