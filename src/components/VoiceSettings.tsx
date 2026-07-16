import type { SpeechVoice } from '../lib/speech'
import type { VoicePreferences } from '../lib/voicePreferences'

type Props = {
  voices: SpeechVoice[]
  preferences: VoicePreferences
  available: boolean
  onVoiceChange: (voiceURI: string) => void
  onRateChange: (rate: number) => void
  onTest: () => void
}

export function VoiceSettings({
  voices,
  preferences,
  available,
  onVoiceChange,
  onRateChange,
  onTest,
}: Props) {
  return (
    <section className="voice-settings" aria-labelledby="voice-settings-title">
      <div className="voice-settings-heading">
        <div>
          <span className="eyebrow">Audio guide</span>
          <h2 id="voice-settings-title">Voice & speed</h2>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onTest} disabled={!available}>
          Test voice
        </button>
      </div>
      <div className="voice-settings-controls">
        <label>
          <span>Voice</span>
          <select
            value={preferences.voiceURI}
            onChange={(event) => onVoiceChange(event.target.value)}
            disabled={!available}
          >
            <option value="">System default</option>
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang}){voice.default ? ' — Default' : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Speed <strong>{preferences.rate.toFixed(2)}×</strong></span>
          <input
            type="range"
            min="0.75"
            max="1.5"
            step="0.05"
            value={preferences.rate}
            onChange={(event) => onRateChange(Number(event.target.value))}
            disabled={!available}
          />
        </label>
      </div>
      {!available && <p className="voice-unavailable">Voice is unavailable in this browser.</p>}
    </section>
  )
}
