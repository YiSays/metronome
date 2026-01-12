export interface Preset {
  id: string
  name: string
  bpm: number
  timeSignature: {
    beatsPerMeasure: number
    beatUnit: 4 | 8
  }
  soundType: 'hollowWood' | 'naturalClave' | 'softLog' | 'mellowBongo' | 'gentleWoodBlock'
  volume: number
}

export const defaultPresets: Preset[] = [
  {
    id: 'slow-practice',
    name: 'Slow Practice',
    bpm: 60,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'softLog',
    volume: 0.5
  },
  {
    id: 'medium-groove',
    name: 'Medium Groove',
    bpm: 100,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'hollowWood',
    volume: 0.55
  },
  {
    id: 'fast-beat',
    name: 'Fast Beat',
    bpm: 140,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'gentleWoodBlock',
    volume: 0.6
  },
  {
    id: 'waltz-time',
    name: 'Waltz Time',
    bpm: 90,
    timeSignature: { beatsPerMeasure: 3, beatUnit: 4 },
    soundType: 'mellowBongo',
    volume: 0.5
  },
  {
    id: 'compound-meter',
    name: 'Compound Meter',
    bpm: 100,
    timeSignature: { beatsPerMeasure: 6, beatUnit: 8 },
    soundType: 'naturalClave',
    volume: 0.55
  },
  {
    id: 'jazz-session',
    name: 'Jazz Session',
    bpm: 160,
    timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
    soundType: 'hollowWood',
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