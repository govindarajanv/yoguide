let sharedContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (sharedContext) return sharedContext
  if (typeof window === 'undefined') return null
  const AudioContextCtor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextCtor) return null
  sharedContext = new AudioContextCtor()
  return sharedContext
}

/** Call during a user gesture (e.g. the Start tap) so the bell can play later. */
export function unlockDing(): void {
  const context = getContext()
  if (context && context.state === 'suspended') void context.resume()
}

export function playDing(): void {
  const context = getContext()
  if (!context) return
  if (context.state === 'suspended') void context.resume()

  const now = context.currentTime
  const duration = 1.2
  const master = context.createGain()
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.35, now + 0.015)
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  master.connect(context.destination)

  const partials = [
    { frequency: 1046.5, gain: 1, decay: 1.1 },
    { frequency: 2093, gain: 0.4, decay: 0.7 },
    { frequency: 3139, gain: 0.15, decay: 0.45 },
  ]

  for (const partial of partials) {
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = partial.frequency
    gainNode.gain.setValueAtTime(0.0001, now)
    gainNode.gain.exponentialRampToValueAtTime(partial.gain, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + partial.decay)
    oscillator.connect(gainNode)
    gainNode.connect(master)
    oscillator.start(now)
    oscillator.stop(now + duration)
  }
}
