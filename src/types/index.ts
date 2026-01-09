export interface MetronomeState {
  isPlaying: boolean
  bpm: number
  timeSignature: TimeSignature
  soundType: SoundType
  volume: number
}

export type TimeSignature = {
  beatsPerMeasure: number
  beatUnit: number
}

export type SoundType = 'woodblock' | 'click' | 'doublePulse' | 'bell' | 'amber'

export interface AudioContextState {
  audioContext: AudioContext | null
  masterGain: GainNode | null
  isInitialized: boolean
}

export interface BeatPattern {
  downbeat: SoundType
  beat: SoundType
}