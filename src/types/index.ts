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

export type SoundType =
  // Existing wooden percussion sounds
  | 'hollowWood' | 'naturalClave' | 'softLog' | 'mellowBongo' | 'gentleWoodBlock'
  | 'warmWoodenClave' | 'softWoodenBlock' | 'naturalWoodenLog' | 'gentleWoodenBongo' | 'mellowWoodenChime'
  // New musical sound families for practice and studio use
  | 'chime'       // Harmonic-rich, pleasant, sustained
  | 'orchestral'  // Clean, professional, traditional
  | 'woodyEnhanced' // Enhanced existing wooden sounds with harmonics
  | 'softMallet'  // Very soft, warm, quiet practice

export interface AudioContextState {
  audioContext: AudioContext | null
  masterGain: GainNode | null
  isInitialized: boolean
}

/**
 * Parameters for fine-tuning sound generation.
 * Values are normalized 0-100% scale for UI control.
 * Actual audio parameters are calculated from these.
 */
export interface SoundParams {
  /** Attack time in milliseconds (1-8ms) - controls sharpness vs softness */
  attackTime?: number
  /** Decay time in milliseconds (50-500ms) - controls sustain length */
  decayTime?: number
  /** Harmonic content percentage (0-100) - controls richness of overtones */
  harmonicContent?: number
  /** Noise level percentage (0-30) - controls percussive click/attack noise */
  noiseLevel?: number
  /** Brightness/frequency cutoff in Hz (1000-5000) - filter brightness */
  brightness?: number
  /** Detune in cents (0-10) - microtonal variation for organic feel */
  detune?: number
}

/**
 * Preset with enhanced sound parameters for musical fine-tuning.
 */
export interface EnhancedPreset {
  id: string
  name: string
  bpm: number
  timeSignature: {
    beatsPerMeasure: number
    beatUnit: 4 | 8
  }
  soundType: SoundType
  volume: number
  // Optional advanced parameters for fine-tuning
  params?: SoundParams
}

export interface BeatPattern {
  downbeat: SoundType
  beat: SoundType
}