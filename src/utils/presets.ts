export interface Preset {
  id: string
  name: string
  bpm: number
  timeSignature: {
    beatsPerMeasure: number
    beatUnit: 4 | 8
  }
  soundType: 'hollowWood' | 'naturalClave' | 'softLog' | 'mellowBongo' | 'gentleWoodBlock' | 'warmWoodenClave' | 'softWoodenBlock' | 'naturalWoodenLog' | 'gentleWoodenBongo' | 'mellowWoodenChime'
  volume: number
}

export const defaultPresets: Preset[] = [
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