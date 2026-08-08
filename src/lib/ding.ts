let sharedContext: AudioContext | null = null
let audioElement: HTMLAudioElement | null = null

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

function buildBellBlob(): Blob {
  const sampleRate = 44_100
  const duration = 1.5
  const samples = Math.floor(sampleRate * duration)
  const dataSize = samples * 2
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i))
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  const partials = [
    { frequency: 1046.5, gain: 1 },
    { frequency: 2093, gain: 0.5 },
    { frequency: 3139, gain: 0.2 },
  ]
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate
    const envelope = Math.exp(-4 * t)
    let wave = 0
    for (const partial of partials) {
      wave += partial.gain * Math.sin(2 * Math.PI * partial.frequency * t)
    }
    const sample = Math.max(-1, Math.min(1, (envelope * wave) / 1.7))
    view.setInt16(44 + i * 2, Math.round(sample * 0x7fff), true)
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

function getAudio(): HTMLAudioElement | null {
  if (audioElement) return audioElement
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return null
  try {
    const url = URL.createObjectURL(buildBellBlob())
    audioElement = new Audio(url)
    audioElement.preload = 'auto'
    return audioElement
  } catch {
    return null
  }
}

/** Call during a user gesture so the bell can play later. */
export function unlockDing(): void {
  const audio = getAudio()
  if (audio && audio.paused) {
    audio.muted = true
    void audio
      .play()
      .catch(() => {})
      .then(() => {
        window.setTimeout(() => {
          if (!audio.paused) {
            audio.pause()
            audio.currentTime = 0
          }
        }, 150)
      })
  }

  const context = getContext()
  if (context && context.state === 'suspended') {
    void context.resume().catch(() => {})
  }
}

let gestureListenersInstalled = false

/**
 * Create/resume the shared audio on the first user gesture anywhere in the
 * app. Browsers suspend audio until a gesture, so this guarantees the ding can
 * play even if the guided Start tap never happens.
 */
function installGestureUnlock(): void {
  if (gestureListenersInstalled || typeof window === 'undefined') return
  gestureListenersInstalled = true
  const unlock = () => {
    unlockDing()
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
    window.removeEventListener('touchend', unlock)
  }
  window.addEventListener('pointerdown', unlock)
  window.addEventListener('keydown', unlock)
  window.addEventListener('touchend', unlock)
}

export async function playDing(): Promise<void> {
  const audio = getAudio()
  if (audio) {
    audio.muted = false
    audio.currentTime = 0
    try {
      await audio.play()
      return
    } catch {
      // Fall through to Web Audio when the media element is blocked.
    }
  }

  const context = getContext()
  if (!context) return
  if (context.state === 'suspended') {
    try {
      await context.resume()
    } catch {
      return
    }
  }
  if (context.state !== 'running') return

  const now = context.currentTime
  const duration = 1.2
  const master = context.createGain()
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.6, now + 0.015)
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  master.connect(context.destination)

  const partials = [
    { frequency: 1046.5, gain: 1, decay: 1.1 },
    { frequency: 2093, gain: 0.5, decay: 0.7 },
    { frequency: 3139, gain: 0.2, decay: 0.45 },
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

installGestureUnlock()
