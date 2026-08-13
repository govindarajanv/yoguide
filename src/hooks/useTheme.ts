import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'yoguide:theme'

function loadTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Storage unavailable; fall back to dark.
  }
  return 'dark'
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(loadTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Storage unavailable; theme still applies for this session.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
