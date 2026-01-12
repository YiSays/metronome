import { AudioContextState, BeatPattern, SoundType } from '../types'

export class AudioGenerator {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private compressor: DynamicsCompressorNode | null = null
  private isInitialized = false

  private createDistortionCurve(amount: number): Float32Array {
    const k = typeof amount === 'number' ? amount : 50
    const n_samples = 44100
    const curve = new Float32Array(n_samples)
    const deg = Math.PI / 180

    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x))
    }
    return curve
  }

  async initialize(): Promise<AudioContextState> {
    if (this.audioContext) {
      return { audioContext: this.audioContext, masterGain: this.masterGain, isInitialized: this.isInitialized }
    }

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      this.compressor = this.audioContext.createDynamicsCompressor()
      const distortion = this.audioContext.createWaveShaper()

      // Softer distortion for dark, warm characteristics
      distortion.curve = this.createDistortionCurve(200) as any
      distortion.oversample = '2x'

      // Compressor for consistent dynamics without harshness
      this.compressor.threshold.setValueAtTime(-25, this.audioContext.currentTime)
      this.compressor.knee.setValueAtTime(10, this.audioContext.currentTime)
      this.compressor.ratio.setValueAtTime(12, this.audioContext.currentTime)
      this.compressor.attack.setValueAtTime(0, this.audioContext.currentTime)
      this.compressor.release.setValueAtTime(0.08, this.audioContext.currentTime)

      // More restrained master volume for long listening
      const preGain = this.audioContext.createGain()
      preGain.gain.value = 0.8

      this.masterGain.gain.value = 2.0 // Clean boost (reduced from 3.0)

      this.masterGain.connect(preGain)
      preGain.connect(distortion)
      distortion.connect(this.compressor)
      this.compressor.connect(this.audioContext.destination)
      this.isInitialized = true

      return { audioContext: this.audioContext, masterGain: this.masterGain, isInitialized: this.isInitialized }
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
      return { audioContext: null, masterGain: null, isInitialized: false }
    }
  }

  createBeatPattern(_audioContext: AudioContext, soundType: SoundType, _volume: number = 0.5): BeatPattern {
    // Downbeat is the same sound type, but will be rendered differently
    return { downbeat: soundType, beat: soundType }
  }

  public createSound(audioContext: AudioContext, soundType: SoundType, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: SoundType } {
    switch (soundType) {
      case 'hollowWood':
        return this.createHollowWoodSound(audioContext, volume, isDownbeat)
      case 'naturalClave':
        return this.createNaturalClaveSound(audioContext, volume, isDownbeat)
      case 'softLog':
        return this.createSoftLogSound(audioContext, volume, isDownbeat)
      case 'mellowBongo':
        return this.createMellowBongoSound(audioContext, volume, isDownbeat)
      case 'gentleWoodBlock':
        return this.createGentleWoodBlockSound(audioContext, volume, isDownbeat)
      default:
        return this.createHollowWoodSound(audioContext, volume, isDownbeat)
    }
  }

  public connectSoundToMaster(sound: { oscillator: OscillatorNode, gainNode: GainNode, soundType: SoundType }, masterGain: GainNode): void {
    const { gainNode } = sound
    gainNode.disconnect()
    gainNode.connect(masterGain)
  }

  // === NATURAL WOODEN PERCUSSION FAMILY ===
  // All sounds mimic natural wood percussion for pleasant long-term listening
  // Downbeats: slightly lower frequency (-20%), slightly longer decay (1.2-1.4x), more resonance

  private createHollowWoodSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'hollowWood' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    // Base: 280Hz | Downbeat: 224Hz (hollow wooden body)
    const baseFreq = isDownbeat ? 224 : 280
    oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime)

    // Triangle wave for natural wooden resonance
    oscillator.type = 'triangle'

    // Filtered to create hollow wooden character
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1000, audioContext.currentTime)
    filter.Q.setValueAtTime(isDownbeat ? 2.5 : 1.5, audioContext.currentTime)

    const volumeBoost = 1.9
    const targetVolume = isDownbeat ? volume * volumeBoost * 1.15 : volume * volumeBoost

    const now = audioContext.currentTime

    // Hollow wood envelope - soft attack, natural decay
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.008)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (isDownbeat ? 0.17 : 0.13))

    oscillator.connect(filter)
    filter.connect(gainNode)

    return { oscillator, gainNode, soundType: 'hollowWood' }
  }

  private createNaturalClaveSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'naturalClave' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    // Base: 880Hz | Downbeat: 704Hz (clave range - higher but natural)
    const baseFreq = isDownbeat ? 704 : 880
    oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime)

    // Sine wave for pure, clear clave sound
    oscillator.type = 'sine'

    // Gentle band-pass for focused wooden tone
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1200, audioContext.currentTime)
    filter.Q.setValueAtTime(isDownbeat ? 8.0 : 6.0, audioContext.currentTime)

    const volumeBoost = 1.5
    const targetVolume = isDownbeat ? volume * volumeBoost * 1.2 : volume * volumeBoost

    const now = audioContext.currentTime

    // Clave envelope - sharp but natural attack, clean decay
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.003)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (isDownbeat ? 0.14 : 0.10))

    oscillator.connect(filter)
    filter.connect(gainNode)

    return { oscillator, gainNode, soundType: 'naturalClave' }
  }

  private createSoftLogSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'softLog' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    // Base: 180Hz | Downbeat: 144Hz (deep log thump)
    const baseFreq = isDownbeat ? 144 : 180
    oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime)

    // Sine wave for deep, soft log thump
    oscillator.type = 'sine'

    // Very dark filter
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(500, audioContext.currentTime)
    filter.Q.setValueAtTime(isDownbeat ? 2.0 : 1.2, audioContext.currentTime)

    const volumeBoost = 2.1
    const targetVolume = isDownbeat ? volume * volumeBoost * 1.18 : volume * volumeBoost

    const now = audioContext.currentTime

    // Soft log envelope - gentle thump, warm decay
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.010)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (isDownbeat ? 0.19 : 0.15))

    oscillator.connect(filter)
    filter.connect(gainNode)

    return { oscillator, gainNode, soundType: 'softLog' }
  }

  private createMellowBongoSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'mellowBongo' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    // Base: 420Hz | Downbeat: 336Hz (bongo middle range)
    const baseFreq = isDownbeat ? 336 : 420
    oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime)

    // Triangle wave for bongo character
    oscillator.type = 'triangle'

    // Warm, resonant filter for bongo tone
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(800, audioContext.currentTime)
    filter.Q.setValueAtTime(isDownbeat ? 3.0 : 2.0, audioContext.currentTime)

    const volumeBoost = 1.8
    const targetVolume = isDownbeat ? volume * volumeBoost * 1.12 : volume * volumeBoost

    const now = audioContext.currentTime

    // Bongo envelope - medium attack, rounded decay
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.006)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (isDownbeat ? 0.16 : 0.12))

    oscillator.connect(filter)
    filter.connect(gainNode)

    return { oscillator, gainNode, soundType: 'mellowBongo' }
  }

  private createGentleWoodBlockSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'gentleWoodBlock' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    // Base: 640Hz | Downbeat: 512Hz (wood block range, softened)
    const baseFreq = isDownbeat ? 512 : 640
    oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime)

    // Triangle wave for wooden block character
    oscillator.type = 'triangle'

    // Natural wood resonance with softer Q
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1100, audioContext.currentTime)
    filter.Q.setValueAtTime(isDownbeat ? 2.0 : 1.0, audioContext.currentTime)

    const volumeBoost = 1.6
    const targetVolume = isDownbeat ? volume * volumeBoost * 1.15 : volume * volumeBoost

    const now = audioContext.currentTime

    // Gentle wood block envelope - soft attack, natural decay
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.007)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (isDownbeat ? 0.15 : 0.11))

    oscillator.connect(filter)
    filter.connect(gainNode)

    return { oscillator, gainNode, soundType: 'gentleWoodBlock' }
  }

  scheduleSound(sound: { oscillator: OscillatorNode, gainNode: GainNode, soundType: SoundType }, time: number, masterGain: GainNode): void {
    const { oscillator, gainNode, soundType } = sound

    try {
      // Connect the gain node to the master gain
      gainNode.disconnect()
      gainNode.connect(masterGain)

      // Start the main oscillator at the scheduled time
      oscillator.start(time)

      // Calculate duration based on sound type
      let duration = 0.1
      switch (soundType) {
        case 'hollowWood':
          duration = 0.15
          break
        case 'naturalClave':
          duration = 0.12
          break
        case 'softLog':
          duration = 0.17
          break
        case 'mellowBongo':
          duration = 0.14
          break
        case 'gentleWoodBlock':
          duration = 0.13
          break
        default:
          duration = 0.1
      }

      // Safety stop for main oscillator
      oscillator.stop(time + duration)

    } catch (error) {
      console.warn('Error scheduling sound:', error)
    }
  }

  setVolume(gainNode: GainNode, volume: number): void {
    if (gainNode) {
      // Apply the 2.0x boost here as well
      gainNode.gain.setValueAtTime(volume * 2.0, this.audioContext?.currentTime || 0)
    }
  }
}