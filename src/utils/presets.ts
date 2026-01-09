export interface Preset {
  id: string
  name: string
  bpm: number
  timeSignature: {
    beatsPerMeasure: number
    beatUnit: 4 | 8
  }
  soundType: 'woodblock' | 'click' | 'doublePulse' | 'bell' | 'amber'
  volume: number
}

export const defaultPresets: Preset[] = [
  {
    id: 'slow-jam',
    name: 'Slow Jam',
    bpm: 60,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'woodblock',
    volume: 0.5
  },
  {
    id: 'medium-groove',
    name: 'Medium Groove',
    bpm: 120,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'click',
    volume: 0.6
  },
  {
    id: 'fast-punk',
    name: 'Fast Punk',
    bpm: 180,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'click',
    volume: 0.7
  },
  {
    id: 'waltz',
    name: 'Waltz Time',
    bpm: 90,
    timeSignature: { beatsPerMeasure: 3, beatUnit: 4 },
    soundType: 'bell',
    volume: 0.5
  },
  {
    id: 'compound',
    name: 'Compound Meter',
    bpm: 100,
    timeSignature: { beatsPerMeasure: 6, beatUnit: 8 },
    soundType: 'woodblock',
    volume: 0.5
  },
  {
    id: 'jazz-swing',
    name: 'Jazz Swing',
    bpm: 160,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'amber',
    volume: 0.6
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