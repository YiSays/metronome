import { AudioContextState, BeatPattern, SoundType, SoundParams } from '../types'

export class AudioGenerator {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private compressor: DynamicsCompressorNode | null = null
  private isInitialized = false
  private noiseBuffer: AudioBuffer | null = null

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

  /**
   * Generates a noise buffer for percussive click/attack sound.
   * Creates 0.1s of filtered white noise at 44.1kHz.
   */
  private generateNoiseBuffer(): AudioBuffer | null {
    if (!this.audioContext) return null

    try {
      const sampleRate = this.audioContext.sampleRate
      const duration = 0.1 // 100ms of noise
      const bufferLength = sampleRate * duration
      const buffer = this.audioContext.createBuffer(1, bufferLength, sampleRate)
      const data = buffer.getChannelData(0)

      // Generate pinkish noise (filtered white noise)
      // Pink noise has equal energy per octave, more musical
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
      for (let i = 0; i < bufferLength; i++) {
        const white = Math.random() * 2 - 1
        // Pink noise filter (Paul Kellet's method)
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
        data[i] *= 0.11 // Scale to -20dB
        b6 = white * 0.115926
      }

      return buffer
    } catch (error) {
      console.warn('Failed to generate noise buffer:', error)
      return null
    }
  }

  /**
   * Creates a noise burst for percussive attack character.
   * Returns AudioBufferSourceNode with filtered noise.
   */
  private createNoiseBurst(audioContext: AudioContext, volume: number, levelPercent: number, brightnessHz: number): AudioBufferSourceNode | null {
    if (!this.noiseBuffer || levelPercent === 0) return null

    try {
      const noiseSource = audioContext.createBufferSource()
      noiseSource.buffer = this.noiseBuffer

      // Highpass filter to isolate attack noise (3-5kHz range)
      const filter = audioContext.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.setValueAtTime(brightnessHz, audioContext.currentTime)
      filter.Q.setValueAtTime(0.7, audioContext.currentTime)

      const noiseGain = audioContext.createGain()
      // Level: 0-30% mapped to -30dB to -10dB
      const gainValue = volume * (levelPercent / 100) * 0.3
      noiseGain.gain.setValueAtTime(gainValue, audioContext.currentTime)

      noiseSource.connect(filter)
      filter.connect(noiseGain)

      return noiseSource
    } catch (error) {
      console.warn('Failed to create noise burst:', error)
      return null
    }
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

      // === Audio Chain Enhancements ===
      // 1. Pre-compressor EQ (gentle shelf at 600Hz for warmth)
      const preEq = this.audioContext.createBiquadFilter()
      preEq.type = 'lowshelf'
      preEq.frequency.setValueAtTime(600, this.audioContext.currentTime)
      preEq.gain.setValueAtTime(2, this.audioContext.currentTime) // +2dB warmth

      // 2. Softer distortion for dark, warm characteristics
      distortion.curve = this.createDistortionCurve(200) as any
      distortion.oversample = '2x'

      // 3. Enhanced compressor for musical dynamics
      // Higher ratio for tighter control, softer knee
      this.compressor.threshold.setValueAtTime(-20, this.audioContext.currentTime)
      this.compressor.knee.setValueAtTime(15, this.audioContext.currentTime) // Softer knee
      this.compressor.ratio.setValueAtTime(8, this.audioContext.currentTime) // Reduced from 12 for more musical dynamics
      this.compressor.attack.setValueAtTime(0.001, this.audioContext.currentTime) // Slightly slower attack
      this.compressor.release.setValueAtTime(0.1, this.audioContext.currentTime) // Slightly longer release

      // 4. Master gain (restrained for long listening)
      const postGain = this.audioContext.createGain()
      postGain.gain.value = 0.8

      this.masterGain.gain.value = 2.0 // Clean boost

      // 5. Generate noise buffer for percussive attacks
      this.noiseBuffer = this.generateNoiseBuffer()

      // Build chain: Master -> PreEq -> Distortion -> Compressor -> PostGain -> Output
      this.masterGain.connect(preEq)
      preEq.connect(distortion)
      distortion.connect(this.compressor)
      this.compressor.connect(postGain)
      postGain.connect(this.audioContext.destination)
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

  public createSound(audioContext: AudioContext, soundType: SoundType, volume: number, isDownbeat: boolean, params?: SoundParams):
    { oscillator: OscillatorNode, gainNode: GainNode, soundType: SoundType } |
    { oscillators: OscillatorNode[], gainNodes: GainNode[], soundType: SoundType, noiseSource?: AudioBufferSourceNode } {
    switch (soundType) {
      // Existing wooden percussion sounds
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
      case 'warmWoodenClave':
        return this.createWarmWoodenClaveSound(audioContext, volume, isDownbeat)
      case 'softWoodenBlock':
        return this.createSoftWoodenBlockSound(audioContext, volume, isDownbeat)
      case 'naturalWoodenLog':
        return this.createNaturalWoodenLogSound(audioContext, volume, isDownbeat)
      case 'gentleWoodenBongo':
        return this.createGentleWoodenBongoSound(audioContext, volume, isDownbeat)
      case 'mellowWoodenChime':
        return this.createMellowWoodenChimeSound(audioContext, volume, isDownbeat)
      // New musical sound families
      case 'chime':
        return this.createChimeSound(audioContext, volume, isDownbeat, params)
      case 'orchestral':
        return this.createOrchestralSound(audioContext, volume, isDownbeat, params)
      case 'woodyEnhanced':
        return this.createWoodyEnhancedSound(audioContext, volume, isDownbeat, params)
      case 'softMallet':
        return this.createSoftMalletSound(audioContext, volume, isDownbeat, params)
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

  // === NEW NATURAL WOODEN PERCUSSION FAMILY ===
  // Designed for pleasant long-term listening in band settings
  // Softer, warmer, more natural resonance for extended use

  private createWarmWoodenClaveSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'warmWoodenClave' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    // Base: 720Hz | Downbeat: 576Hz (warmer clave range)
    const baseFreq = isDownbeat ? 576 : 720
    oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime)

    // Sine wave for pure, warm clave sound
    oscillator.type = 'sine'

    // Gentle lowpass for warm wooden tone
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1400, audioContext.currentTime)
    filter.Q.setValueAtTime(isDownbeat ? 1.8 : 1.2, audioContext.currentTime)

    const volumeBoost = 1.4
    const targetVolume = isDownbeat ? volume * volumeBoost * 1.1 : volume * volumeBoost

    const now = audioContext.currentTime

    // Warm clave envelope - soft attack, gentle decay
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.005)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (isDownbeat ? 0.18 : 0.14))

    oscillator.connect(filter)
    filter.connect(gainNode)

    return { oscillator, gainNode, soundType: 'warmWoodenClave' }
  }

  private createSoftWoodenBlockSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'softWoodenBlock' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    // Base: 560Hz | Downbeat: 448Hz (softer wood block range)
    const baseFreq = isDownbeat ? 448 : 560
    oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime)

    // Triangle wave for soft wooden character
    oscillator.type = 'triangle'

    // Very gentle filter for soft wood tone
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(900, audioContext.currentTime)
    filter.Q.setValueAtTime(isDownbeat ? 1.5 : 0.8, audioContext.currentTime)

    const volumeBoost = 1.3
    const targetVolume = isDownbeat ? volume * volumeBoost * 1.1 : volume * volumeBoost

    const now = audioContext.currentTime

    // Soft wood block envelope - very gentle attack, warm decay
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.008)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (isDownbeat ? 0.20 : 0.16))

    oscillator.connect(filter)
    filter.connect(gainNode)

    return { oscillator, gainNode, soundType: 'softWoodenBlock' }
  }

  private createNaturalWoodenLogSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'naturalWoodenLog' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    // Base: 160Hz | Downbeat: 128Hz (deep, natural log thump)
    const baseFreq = isDownbeat ? 128 : 160
    oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime)

    // Sine wave for deep, natural log thump
    oscillator.type = 'sine'

    // Very dark, warm filter
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(400, audioContext.currentTime)
    filter.Q.setValueAtTime(isDownbeat ? 1.8 : 1.0, audioContext.currentTime)

    const volumeBoost = 1.8
    const targetVolume = isDownbeat ? volume * volumeBoost * 1.1 : volume * volumeBoost

    const now = audioContext.currentTime

    // Natural log envelope - gentle thump, very warm decay
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.012)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (isDownbeat ? 0.22 : 0.18))

    oscillator.connect(filter)
    filter.connect(gainNode)

    return { oscillator, gainNode, soundType: 'naturalWoodenLog' }
  }

  private createGentleWoodenBongoSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'gentleWoodenBongo' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    // Base: 380Hz | Downbeat: 304Hz (gentle bongo range)
    const baseFreq = isDownbeat ? 304 : 380
    oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime)

    // Triangle wave for gentle bongo character
    oscillator.type = 'triangle'

    // Warm, gentle filter for bongo tone
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(700, audioContext.currentTime)
    filter.Q.setValueAtTime(isDownbeat ? 2.2 : 1.4, audioContext.currentTime)

    const volumeBoost = 1.5
    const targetVolume = isDownbeat ? volume * volumeBoost * 1.1 : volume * volumeBoost

    const now = audioContext.currentTime

    // Gentle bongo envelope - medium attack, warm decay
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.007)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (isDownbeat ? 0.19 : 0.15))

    oscillator.connect(filter)
    filter.connect(gainNode)

    return { oscillator, gainNode, soundType: 'gentleWoodenBongo' }
  }

  private createMellowWoodenChimeSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'mellowWoodenChime' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    // Base: 960Hz | Downbeat: 768Hz (mellow chime range)
    const baseFreq = isDownbeat ? 768 : 960
    oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime)

    // Sine wave for pure chime sound
    oscillator.type = 'sine'

    // Gentle band-pass for focused chime tone
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1600, audioContext.currentTime)
    filter.Q.setValueAtTime(isDownbeat ? 4.0 : 2.5, audioContext.currentTime)

    const volumeBoost = 1.2
    const targetVolume = isDownbeat ? volume * volumeBoost * 1.1 : volume * volumeBoost

    const now = audioContext.currentTime

    // Mellow chime envelope - soft attack, gentle decay
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.004)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (isDownbeat ? 0.16 : 0.12))

    oscillator.connect(filter)
    filter.connect(gainNode)

    return { oscillator, gainNode, soundType: 'mellowWoodenChime' }
  }

  // === NEW MUSICAL SOUND FAMILIES ===
  // Enhanced sound families designed for practice and studio use
  // Focus on harmonic richness, musicality, and reduced listening fatigue

  /**
   * Chime Family: Harmonic-rich, pleasant, sustained
   * - 3 harmonics (fundamental + perfect 5th + octave)
   * - Soft attack, long decay
   * - Light noise for articulation
   */
  private createChimeSound(audioContext: AudioContext, volume: number, isDownbeat: boolean, params?: SoundParams): { oscillators: OscillatorNode[], gainNodes: GainNode[], soundType: 'chime', noiseSource?: AudioBufferSourceNode } {
    const now = audioContext.currentTime
    const harmonics = params?.harmonicContent ?? 50
    const brightness = params?.brightness ?? 3000

    // Base frequencies: C5 (523Hz) for regular, C4 (261Hz) for downbeat
    const baseFreq = isDownbeat ? 261.63 : 523.25
    const detune = (params?.detune ?? 0) / 100 // Convert cents to multiplier

    // Harmonic ratios: 1:1.5:2 (octave + perfect 5th + octave up)
    const ratios = [1.0, 1.5, 2.0]
    const harmonicGains = [
      1.0,                            // Fundamental: 0dB
      0.18 * (harmonics / 100),       // Perfect 5th: -15dB to -10dB based on content
      0.10 * (harmonics / 100)        // Octave: -20dB to -15dB based on content
    ]

    const oscillators: OscillatorNode[] = []
    const gainNodes: GainNode[] = []

    ratios.forEach((ratio, i) => {
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()

      // Use sine for pure, pleasant harmonics
      osc.type = 'sine'
      osc.frequency.setValueAtTime(baseFreq * ratio * (1 + detune * (i - 1)), audioContext.currentTime)

      // Soft attack, longer decay for chime character
      const attackTime = params?.attackTime ? params.attackTime / 1000 : 0.003
      const decayTime = params?.decayTime ? params.decayTime / 1000 : (isDownbeat ? 0.25 : 0.20)

      const targetVolume = volume * 0.8 * harmonicGains[i] * (isDownbeat ? 1.1 : 1.0)

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(targetVolume, now + attackTime)
      gain.gain.exponentialRampToValueAtTime(0.001, now + attackTime + decayTime)

      osc.connect(gain)
      oscillators.push(osc)
      gainNodes.push(gain)
    })

    // Add noise burst if noiseLevel > 0
    let noiseSource: AudioBufferSourceNode | null = null
    const noiseLevel = params?.noiseLevel ?? 0
    if (noiseLevel > 0) {
      noiseSource = this.createNoiseBurst(audioContext, volume, noiseLevel, Math.min(5000, brightness + 1000))
      if (noiseSource) {
        // Connect noise to first gain node for timing
        const noiseGain = audioContext.createGain()
        noiseGain.gain.setValueAtTime(1.0, now)
        noiseSource.connect(noiseGain)
        gainNodes[0].disconnect()
        gainNodes[0].connect(audioContext.destination) // Placeholder, will be reconnected in scheduleSound
      }
    }

    return { oscillators, gainNodes, soundType: 'chime', noiseSource: noiseSource ?? undefined }
  }

  /**
   * Orchestral Family: Clean, professional, traditional
   * - 2 harmonics (fundamental + perfect 5th)
   * - Sharp attack, medium decay
   * - Minimal noise, focused click
   */
  private createOrchestralSound(audioContext: AudioContext, volume: number, isDownbeat: boolean, params?: SoundParams): { oscillators: OscillatorNode[], gainNodes: GainNode[], soundType: 'orchestral', noiseSource?: AudioBufferSourceNode } {
    const now = audioContext.currentTime
    const harmonics = params?.harmonicContent ?? 30
    const brightness = params?.brightness ?? 4000

    // Base frequencies: A5 (880Hz) for regular, A4 (440Hz) for downbeat (orchestral standard)
    const baseFreq = isDownbeat ? 440 : 880
    const detune = (params?.detune ?? 0) / 100

    // Harmonic ratios: 1:1.5 (octave + perfect 5th)
    const ratios = [1.0, 1.5]
    const harmonicGains = [
      1.0,                           // Fundamental: 0dB
      0.22 * (harmonics / 100)       // Perfect 5th: -13dB to -8dB based on content
    ]

    const oscillators: OscillatorNode[] = []
    const gainNodes: GainNode[] = []

    ratios.forEach((ratio, i) => {
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()

      // Use sine for pure orchestral sound
      osc.type = 'sine'
      osc.frequency.setValueAtTime(baseFreq * ratio * (1 + detune * (i - 1)), audioContext.currentTime)

      // Sharp attack, medium decay for traditional metronome
      const attackTime = params?.attackTime ? params.attackTime / 1000 : 0.0015
      const decayTime = params?.decayTime ? params.decayTime / 1000 : (isDownbeat ? 0.12 : 0.08)

      const targetVolume = volume * 0.9 * harmonicGains[i] * (isDownbeat ? 1.15 : 1.0)

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(targetVolume, now + attackTime)
      gain.gain.exponentialRampToValueAtTime(0.001, now + attackTime + decayTime)

      osc.connect(gain)
      oscillators.push(osc)
      gainNodes.push(gain)
    })

    // Minimal noise for focused click
    let noiseSource: AudioBufferSourceNode | null = null
    const noiseLevel = params?.noiseLevel ?? 5 // Default 5% for articulation
    if (noiseLevel > 0) {
      noiseSource = this.createNoiseBurst(audioContext, volume, noiseLevel, brightness)
    }

    return { oscillators, gainNodes, soundType: 'orchestral', noiseSource: noiseSource ?? undefined }
  }

  /**
   * Woody Enhanced Family: Natural wooden sounds with added harmonics and noise
   * - Enhances existing triangle/sine wooden tones with harmonic content
   * - Adds wood-like noise burst during attack
   * - Natural, warm, analog-like character
   */
  private createWoodyEnhancedSound(audioContext: AudioContext, volume: number, isDownbeat: boolean, params?: SoundParams): { oscillators: OscillatorNode[], gainNodes: GainNode[], soundType: 'woodyEnhanced', noiseSource?: AudioBufferSourceNode } {
    const now = audioContext.currentTime
    const harmonics = params?.harmonicContent ?? 70
    const brightness = params?.brightness ?? 2500

    // Base frequency: Warm wooden body range (340Hz regular, 272Hz downbeat)
    const baseFreq = isDownbeat ? 272 : 340
    const detune = (params?.detune ?? 2) / 100 // Slight detune for organic feel

    // Use triangle as primary for wood character, add sine harmonic
    const oscillators: OscillatorNode[] = []
    const gainNodes: GainNode[] = []

    // Primary oscillator (triangle - wooden body)
    const osc1 = audioContext.createOscillator()
    const gain1 = audioContext.createGain()
    osc1.type = 'triangle'
    osc1.frequency.setValueAtTime(baseFreq * (1 - detune * 0.5), audioContext.currentTime)

    // Secondary oscillator (sine - harmonic body, musical)
    const osc2 = audioContext.createOscillator()
    const gain2 = audioContext.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(baseFreq * 2.0 * (1 + detune * 0.5), audioContext.currentTime) // Octave up

    // Attack/decay
    const attackTime = params?.attackTime ? params.attackTime / 1000 : 0.006
    const decayTime = params?.decayTime ? params.decayTime / 1000 : (isDownbeat ? 0.18 : 0.14)

    // Volume and harmonic balance
    const primaryVolume = volume * 1.5 * (isDownbeat ? 1.1 : 1.0)
    const harmonicVolume = volume * 1.5 * 0.25 * (harmonics / 100) * (isDownbeat ? 1.1 : 1.0)

    // Envelope for primary oscillator
    gain1.gain.setValueAtTime(0, now)
    gain1.gain.linearRampToValueAtTime(primaryVolume, now + attackTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + attackTime + decayTime)

    // Envelope for harmonic oscillator (slightly softer)
    gain2.gain.setValueAtTime(0, now)
    gain2.gain.linearRampToValueAtTime(harmonicVolume, now + attackTime * 1.2)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + attackTime * 1.2 + decayTime * 1.2)

    // Filter for wooden resonance
    const filter1 = audioContext.createBiquadFilter()
    filter1.type = 'lowpass'
    filter1.frequency.setValueAtTime(1200, audioContext.currentTime)
    filter1.Q.setValueAtTime(isDownbeat ? 2.5 : 1.8, audioContext.currentTime)

    osc1.connect(filter1)
    filter1.connect(gain1)
    oscillators.push(osc1)
    gainNodes.push(gain1)

    const filter2 = audioContext.createBiquadFilter()
    filter2.type = 'lowpass'
    filter2.frequency.setValueAtTime(2000, audioContext.currentTime)
    filter2.Q.setValueAtTime(1.0, audioContext.currentTime)

    osc2.connect(filter2)
    filter2.connect(gain2)
    oscillators.push(osc2)
    gainNodes.push(gain2)

    // Wood noise burst (more prominent for enhanced woody character)
    let noiseSource: AudioBufferSourceNode | null = null
    const noiseLevel = params?.noiseLevel ?? 15 // Default 15% for woody character
    if (noiseLevel > 0) {
      noiseSource = this.createNoiseBurst(audioContext, volume, noiseLevel, Math.min(4000, brightness))
    }

    return { oscillators, gainNodes, soundType: 'woodyEnhanced', noiseSource: noiseSource ?? undefined }
  }

  /**
   * Soft Mallet Family: Very soft, warm, quiet practice
   * - Low frequencies, gentle harmonics
   * - Very soft attack, extended decay
   * - No noise, purely warm tones
   */
  private createSoftMalletSound(audioContext: AudioContext, volume: number, isDownbeat: boolean, params?: SoundParams): { oscillators: OscillatorNode[], gainNodes: GainNode[], soundType: 'softMallet', noiseSource?: AudioBufferSourceNode } {
    const now = audioContext.currentTime
    const harmonics = params?.harmonicContent ?? 40
    const brightness = params?.brightness ?? 1500

    // Low frequencies: F4 (349Hz) for regular, F3 (175Hz) for downbeat
    const baseFreq = isDownbeat ? 174.61 : 349.23
    const detune = (params?.detune ?? 3) / 100 // Slight detune for warmth

    // Gentle harmonic series: 1:1.25:1.5 (perfect 4th + minor 3rd)
    const ratios = [1.0, 1.25, 1.5]
    const harmonicGains = [
      1.0,                           // Fundamental: 0dB
      0.15 * (harmonics / 100),      // Perfect 4th: -16dB to -11dB
      0.10 * (harmonics / 100)       // Minor 3rd: -20dB to -15dB
    ]

    const oscillators: OscillatorNode[] = []
    const gainNodes: GainNode[] = []

    ratios.forEach((ratio, i) => {
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()

      // Sine wave for soft, warm character
      osc.type = 'sine'
      osc.frequency.setValueAtTime(baseFreq * ratio * (1 + detune * (i - 1)), audioContext.currentTime)

      // Very soft attack, extended decay
      const attackTime = params?.attackTime ? params.attackTime / 1000 : 0.008
      const decayTime = params?.decayTime ? params.decayTime / 1000 : (isDownbeat ? 0.30 : 0.22)

      const targetVolume = volume * 0.5 * harmonicGains[i] * (isDownbeat ? 1.1 : 1.0)

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(targetVolume, now + attackTime)
      gain.gain.exponentialRampToValueAtTime(0.001, now + attackTime + decayTime)

      // Gentle filter for warm low-mids
      const filter = audioContext.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(brightness, audioContext.currentTime)
      filter.Q.setValueAtTime(0.8, audioContext.currentTime)

      osc.connect(filter)
      filter.connect(gain)
      oscillators.push(osc)
      gainNodes.push(gain)
    })

    // No noise for pure soft mallet sound
    return { oscillators, gainNodes, soundType: 'softMallet' }
  }

  scheduleSound(
    sound: { oscillator: OscillatorNode, gainNode: GainNode, soundType: SoundType } | { oscillators: OscillatorNode[], gainNodes: GainNode[], soundType: SoundType, noiseSource?: AudioBufferSourceNode },
    time: number,
    masterGain: GainNode
  ): void {
    try {
      // Check if this is a multi-oscillator sound (new format)
      if ('oscillators' in sound && 'gainNodes' in sound) {
        const { oscillators, gainNodes, soundType, noiseSource } = sound

        // Connect all gain nodes to master gain
        gainNodes.forEach(gainNode => {
          gainNode.disconnect()
          gainNode.connect(masterGain)
        })

        // Start all oscillators at the scheduled time
        oscillators.forEach(osc => osc.start(time))

        // Calculate duration based on sound type
        let duration = this.getSoundDuration(soundType)

        // Safety stop for all oscillators
        oscillators.forEach(osc => osc.stop(time + duration))

        // Handle noise burst if present
        if (noiseSource) {
          const noiseGain = masterGain.context.createGain()
          noiseGain.gain.setValueAtTime(1.0, time)
          noiseSource.connect(noiseGain)
          noiseGain.connect(masterGain)
          noiseSource.start(time)
          noiseSource.stop(time + 0.05) // Noise burst is short (50ms)
        }
      } else {
        // Legacy single oscillator format
        const { oscillator, gainNode, soundType } = sound

        // Connect the gain node to the master gain
        gainNode.disconnect()
        gainNode.connect(masterGain)

        // Start the main oscillator at the scheduled time
        oscillator.start(time)

        // Calculate duration based on sound type
        const duration = this.getSoundDuration(soundType)

        // Safety stop for main oscillator
        oscillator.stop(time + duration)
      }
    } catch (error) {
      console.warn('Error scheduling sound:', error)
    }
  }

  /**
   * Get the duration for a given sound type.
   * Used by scheduleSound to determine when to stop oscillators.
   */
  private getSoundDuration(soundType: SoundType): number {
    switch (soundType) {
      // Existing wooden percussion
      case 'hollowWood': return 0.15
      case 'naturalClave': return 0.12
      case 'softLog': return 0.17
      case 'mellowBongo': return 0.14
      case 'gentleWoodBlock': return 0.13
      case 'warmWoodenClave': return 0.18
      case 'softWoodenBlock': return 0.20
      case 'naturalWoodenLog': return 0.22
      case 'gentleWoodenBongo': return 0.19
      case 'mellowWoodenChime': return 0.16
      // New musical families
      case 'chime': return 0.25
      case 'orchestral': return 0.12
      case 'woodyEnhanced': return 0.18
      case 'softMallet': return 0.28
      default: return 0.1
    }
  }

  setVolume(gainNode: GainNode, volume: number): void {
    if (gainNode) {
      // Apply the 2.0x boost here as well
      gainNode.gain.setValueAtTime(volume * 2.0, this.audioContext?.currentTime || 0)
    }
  }
}