import { SoundParams } from '../types'

export interface Preset {
  id: string
  name: string
  bpm: number
  timeSignature: {
    beatsPerMeasure: number
    beatUnit: 4 | 8
  }
  soundType: 'hollowWood' | 'naturalClave' | 'softLog' | 'mellowBongo' | 'gentleWoodBlock' | 'warmWoodenClave' | 'softWoodenBlock' | 'naturalWoodenLog' | 'gentleWoodenBongo' | 'mellowWoodenChime' | 'chime' | 'orchestral' | 'woodyEnhanced' | 'softMallet'
  volume: number
  // Optional advanced parameters for fine-tuning
  params?: SoundParams
}

export const defaultPresets: Preset[] = [
  // === Original Wooden Percussion Presets ===
  {
    id: 'warm-practice',
    name: 'Warm Practice',
    bpm: 75,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'warmWoodenClave',
    volume: 0.5
  },
  {
    id: 'soft-groove',
    name: 'Soft Groove',
    bpm: 95,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'softWoodenBlock',
    volume: 0.55
  },
  {
    id: 'natural-beat',
    name: 'Natural Beat',
    bpm: 120,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'naturalWoodenLog',
    volume: 0.5
  },
  {
    id: 'gentle-waltz',
    name: 'Gentle Waltz',
    bpm: 85,
    timeSignature: { beatsPerMeasure: 3, beatUnit: 4 },
    soundType: 'gentleWoodenBongo',
    volume: 0.5
  },
  {
    id: 'mellow-compound',
    name: 'Mellow Compound',
    bpm: 90,
    timeSignature: { beatsPerMeasure: 6, beatUnit: 8 },
    soundType: 'mellowWoodenChime',
    volume: 0.55
  },
  {
    id: 'slow-practice',
    name: 'Slow Practice',
    bpm: 60,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'softLog',
    volume: 0.5
  },

  // === New Curated Presets for Practice & Studio ===

  // 1. "Studio Click" - Clean, precise, unobtrusive (Orchestral family)
  {
    id: 'studio-click',
    name: 'Studio Click',
    bpm: 120,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'orchestral',
    volume: 0.5,
    params: {
      attackTime: 1.5,      // Sharp attack
      decayTime: 80,        // Medium decay
      harmonicContent: 25,  // Low harmonic content for clarity
      noiseLevel: 5,        // Minimal noise
      brightness: 4000,     // Bright but clean
      detune: 0             // Pure tuning
    }
  },

  // 2. "Practice Chime" - Pleasant, sustained, ear-training friendly (Chime family)
  {
    id: 'practice-chime',
    name: 'Practice Chime',
    bpm: 80,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'chime',
    volume: 0.45,
    params: {
      attackTime: 3,        // Soft attack
      decayTime: 220,       // Sustained decay
      harmonicContent: 65,  // Rich harmonics
      noiseLevel: 0,        // No noise - pure tones
      brightness: 3000,     // Warm brightness
      detune: 0             // Pure tuning
    }
  },

  // 3. "Warm Wood" - Natural, analog, warm (Woody Enhanced family)
  {
    id: 'warm-wood',
    name: 'Warm Wood',
    bpm: 100,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'woodyEnhanced',
    volume: 0.5,
    params: {
      attackTime: 6,        // Gentle attack
      decayTime: 150,       // Natural decay
      harmonicContent: 75,  // Full harmonics
      noiseLevel: 15,       // Light wood noise
      brightness: 2500,     // Warm tone
      detune: 2             // Slight detune for organic feel
    }
  },

  // 4. "Quiet Mallet" - Very soft, gentle, quiet practice (Soft Mallet family)
  {
    id: 'quiet-mallet',
    name: 'Quiet Mallet',
    bpm: 60,
    timeSignature: { beatsPerMeasure: 3, beatUnit: 4 },
    soundType: 'softMallet',
    volume: 0.35,
    params: {
      attackTime: 8,        // Very soft attack
      decayTime: 280,       // Extended decay
      harmonicContent: 40,  // Gentle harmonics
      noiseLevel: 0,        // No noise - purely soft
      brightness: 1500,     // Dark, warm tone
      detune: 3             // Detune for warmth
    }
  },

  // 5. "Jazz Studio" - Snappy but warm, slight groove feel (Woody Enhanced)
  {
    id: 'jazz-studio',
    name: 'Jazz Studio',
    bpm: 90,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'woodyEnhanced',
    volume: 0.52,
    params: {
      attackTime: 4,        // Snappy but warm attack
      decayTime: 130,       // Medium decay
      harmonicContent: 60,  // Balanced harmonics
      noiseLevel: 10,       // Light click
      brightness: 2800,     // Warm but present
      detune: 1.5           // Slight organic variation
    }
  },

  // 6. "Recording Reference" - Very clean, no coloration (Orchestral + minimal)
  {
    id: 'recording-reference',
    name: 'Recording Reference',
    bpm: 100,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'orchestral',
    volume: 0.48,
    params: {
      attackTime: 2,        // Clean attack
      decayTime: 100,       // Precise decay
      harmonicContent: 15,  // Very low harmonics - nearly pure tone
      noiseLevel: 0,        // No noise at all
      brightness: 3500,     // Clean brightness
      detune: 0             // Perfectly tuned
    }
  }
]

export const PresetManager = {
  savePreset: (preset: Preset): void => {
    const presets = PresetManager.getAllPresets()
    const existingIndex = presets.findIndex(p => p.id === preset.id)

    if (existingIndex >= 0) {
      presets[existingIndex] = preset
    } else {
      presets.push(preset)
    }

    localStorage.setItem('metronome_presets', JSON.stringify(presets))
  },

  loadPreset: (id: string): Preset | null => {
    const presets = PresetManager.getAllPresets()
    return presets.find(p => p.id === id) || null
  },

  deletePreset: (id: string): void => {
    const presets = PresetManager.getAllPresets().filter(p => p.id !== id)
    localStorage.setItem('metronome_presets', JSON.stringify(presets))
  },

  getAllPresets: (): Preset[] => {
    try {
      const saved = localStorage.getItem('metronome_presets')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading presets:', error)
    }
    return [...defaultPresets]
  },

  exportPresets: (): string => {
    const presets = PresetManager.getAllPresets()
    return JSON.stringify(presets, null, 2)
  },

  importPresets: (jsonString: string): void => {
    try {
      const imported = JSON.parse(jsonString)
      if (Array.isArray(imported)) {
        localStorage.setItem('metronome_presets', JSON.stringify(imported))
      }
    } catch (error) {
      console.error('Error importing presets:', error)
      throw new Error('Invalid preset data format')
    }
  },

  resetToDefaults: (): void => {
    localStorage.setItem('metronome_presets', JSON.stringify(defaultPresets))
  }
}