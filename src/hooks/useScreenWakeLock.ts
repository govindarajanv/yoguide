import { useEffect } from 'react'

/** Keep the screen awake during an active guided session when the browser supports it. */
export function useScreenWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return

    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      if (cancelled || document.visibilityState !== 'visible') return
      try {
        lock = await navigator.wakeLock.request('screen')
        lock.addEventListener('release', () => {
          lock = null
          if (!cancelled) void acquire()
        })
      } catch {
        // Unsupported, denied, or low-power mode — timers still reconcile on visibility.
      }
    }

    void acquire()

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      void lock?.release()
    }
  }, [active])
}
