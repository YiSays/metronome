import React from 'react'
import { TimeSignature, SoundType } from '../types'

interface MetronomeControlsProps {
  onPlay: () => void
  onPause: () => void
  isPlaying: boolean
  bpm: number
  onBpmChange: (bpm: number) => void
  timeSignature: TimeSignature
  onTimeSignatureChange: (ts: TimeSignature) => void
  soundType: SoundType
  onSoundTypeChange: (st: SoundType) => void
  volume: number
  onVolumeChange: (volume: number) => void
}

const MetronomeControls: React.FC<MetronomeControlsProps> = ({
  bpm,
  onBpmChange,
  timeSignature,
  onTimeSignatureChange,
  soundType,
  onSoundTypeChange
}) => {

  const timeSignatureOptions = [
    { beatsPerMeasure: 4, beatUnit: 4, label: '4/4 (Common)', description: '1-2-3-4, 1 is downbeat' },
    { beatsPerMeasure: 3, beatUnit: 4, label: '3/4 (Waltz)', description: '1-2-3, 1 is downbeat' },
    { beatsPerMeasure: 6, beatUnit: 8, label: '6/8 (Compound)', description: '1-2-3-4-5-6, 1 is downbeat' },
    { beatsPerMeasure: 2, beatUnit: 4, label: '2/4 (March)', description: '1-2, 1 is downbeat' },
    { beatsPerMeasure: 5, beatUnit: 4, label: '5/4 (Odd)', description: '1-2-3-4-5, 1 is downbeat' },
    { beatsPerMeasure: 7, beatUnit: 4, label: '7/4 (Odd)', description: '1-2-3-4-5-6-7, 1 is downbeat' }
  ]

  const soundTypeOptions = [
    { value: 'woodblock', label: 'Woodblock', description: 'Warm, percussive' },
    { value: 'click', label: 'Modern Click', description: 'Clean, precise' },
    { value: 'doublePulse', label: 'Double Pulse', description: 'Pendulum style' },
    { value: 'bell', label: 'Bell', description: 'Musical, pleasant' },
    { value: 'amber', label: 'Amber', description: 'Full-bodied thock' }
  ]

  return (
    <div className="metronome-controls">
      <div className="control-group bpm-section">
        <div className="bpm-control-row">
          <div className="bpm-slider-container">
            <input
              type="range"
              min="40"
              max="240"
              value={bpm}
              onChange={(e) => onBpmChange(parseInt(e.target.value))}
              className="bpm-slider"
            />
            <div className="bpm-range">
              <span>40</span>
              <span>240</span>
            </div>
          </div>
          <div className="bpm-display">
            <div className="bpm-value">{bpm}</div>
            <div className="bpm-label">BPM</div>
          </div>
        </div>
      </div>

      <div className="control-row">
        <div className="control-group">
          <label className="control-label">Beat Type</label>
          <select
            value={`${timeSignature.beatsPerMeasure}/${timeSignature.beatUnit}`}
            onChange={(e) => {
              const [beats, unit] = e.target.value.split('/').map(Number)
              onTimeSignatureChange({ beatsPerMeasure: beats, beatUnit: unit })
            }}
            className="time-signature-select"
          >
            {timeSignatureOptions.map((ts) => (
              <option key={ts.label} value={`${ts.beatsPerMeasure}/${ts.beatUnit}`}>
                {ts.label}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label className="control-label">Sound Type</label>
          <select
            value={soundType}
            onChange={(e) => onSoundTypeChange(e.target.value as SoundType)}
            className="sound-type-select"
          >
            {soundTypeOptions.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default MetronomeControls