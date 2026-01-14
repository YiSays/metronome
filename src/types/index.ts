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

export type SoundType = 'hollowWood' | 'naturalClave' | 'softLog' | 'mellowBongo' | 'gentleWoodBlock' | 'warmWoodenClave' | 'softWoodenBlock' | 'naturalWoodenLog' | 'gentleWoodenBongo' | 'mellowWoodenChime'

export interface AudioContextState {
  audioContext: AudioContext | null
  masterGain: GainNode | null
  isInitialized: boolean
}

export interface BeatPattern {
  downbeat: SoundType
  beat: SoundType
}