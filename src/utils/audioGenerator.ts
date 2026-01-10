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
      
      // Configure distortion for "angry" loudness (soft clipping/saturation)
      distortion.curve = this.createDistortionCurve(400) as any // Amount of distortion
      distortion.oversample = '4x'

      // Configure compressor to prevent clipping while allowing high volume
      this.compressor.threshold.setValueAtTime(-20, this.audioContext.currentTime) // Lower threshold to catch more peaks
      this.compressor.knee.setValueAtTime(0, this.audioContext.currentTime) // Hard knee
      this.compressor.ratio.setValueAtTime(20, this.audioContext.currentTime) // High ratio (limiting)
      this.compressor.attack.setValueAtTime(0, this.audioContext.currentTime)
      this.compressor.release.setValueAtTime(0.1, this.audioContext.currentTime)

      // Boost master volume significantly
      // The chain: Input -> Distortion -> Compressor -> MasterGain -> Destination
      // We use a pre-gain to drive the distortion
      const preGain = this.audioContext.createGain()
      preGain.gain.value = 1.0 // Drive into distortion

      this.masterGain.gain.value = 3.0 // Final makeup gain (huge boost)
      
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
    return { downbeat: soundType, beat: soundType }
  }

  public createSound(audioContext: AudioContext, soundType: SoundType, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: SoundType, extraOscillators?: OscillatorNode[] } {
    // We pass the volume but we'll also apply internal boosting
    switch (soundType) {
      case 'woodblock':
        return this.createWoodblockSound(audioContext, volume, isDownbeat)
      case 'click':
        return this.createClickSound(audioContext, volume, isDownbeat)
      case 'doublePulse':
        return this.createDoublePulseSound(audioContext, volume, isDownbeat)
      case 'bell':
        return this.createBellSound(audioContext, volume, isDownbeat)
      case 'amber':
        return this.createAmberSound(audioContext, volume, isDownbeat)
      default:
        return this.createWoodblockSound(audioContext, volume, isDownbeat)
    }
  }

  public connectSoundToMaster(sound: { oscillator: OscillatorNode, gainNode: GainNode, soundType: SoundType }, masterGain: GainNode): void {
    const { gainNode } = sound
    gainNode.disconnect()
    gainNode.connect(masterGain)
  }

  // Individual sounds boosted by ~2x (total 4x with master gain boost)
  private createWoodblockSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'woodblock' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    const frequency = isDownbeat ? 1200 : 1000
    const duration = isDownbeat ? 0.045 : 0.035

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)

    const now = audioContext.currentTime
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume * 6.0, now + 0.005) 
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

    oscillator.connect(gainNode)
    return { oscillator, gainNode, soundType: 'woodblock' }
  }

  private createClickSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'click' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    const frequency = isDownbeat ? 2000 : 1600
    const duration = isDownbeat ? 0.027 : 0.02

    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)

    const now = audioContext.currentTime
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume * 5.0, now + 0.002) 
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

    oscillator.connect(gainNode)
    return { oscillator, gainNode, soundType: 'click' }
  }

  private createDoublePulseSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'doublePulse' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    const frequency = 1000
    const now = audioContext.currentTime

    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(frequency, now)

    if (isDownbeat) {
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(volume * 4.0, now + 0.002) 
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.008)
      gainNode.gain.setValueAtTime(0, now + 0.020)
      gainNode.gain.linearRampToValueAtTime(volume * 4.0, now + 0.022) 
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.030)
    } else {
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(volume * 4.0, now + 0.002)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.010)
    }

    oscillator.connect(gainNode)
    return { oscillator, gainNode, soundType: 'doublePulse' }
  }

  private createBellSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'bell', extraOscillators: OscillatorNode[] } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const harmonicOsc = audioContext.createOscillator()
    const harmonicGain = audioContext.createGain()

    const baseFrequency = isDownbeat ? 880 : 660 
    const duration = isDownbeat ? 0.08 : 0.06

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(baseFrequency, audioContext.currentTime)

    harmonicOsc.type = 'sine'
    harmonicOsc.frequency.setValueAtTime(baseFrequency * 2, audioContext.currentTime)

    const now = audioContext.currentTime
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume * 7.0, now + 0.005) 
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

    harmonicGain.gain.setValueAtTime(volume * 2.0, audioContext.currentTime)

    oscillator.connect(gainNode)
    harmonicOsc.connect(harmonicGain)
    harmonicGain.connect(gainNode)

    return { oscillator, gainNode, soundType: 'bell', extraOscillators: [harmonicOsc] }
  }

  private createAmberSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'amber', extraOscillators: OscillatorNode[] } {
    const mainOsc = audioContext.createOscillator()
    const bodyOsc = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    const baseFrequency = isDownbeat ? 880 : 800 
    const duration = isDownbeat ? 0.068 : 0.055

    mainOsc.type = 'square'
    mainOsc.frequency.setValueAtTime(baseFrequency, audioContext.currentTime)

    bodyOsc.type = 'triangle'
    bodyOsc.frequency.setValueAtTime(350, audioContext.currentTime)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2000, audioContext.currentTime)
    filter.Q.setValueAtTime(0.8, audioContext.currentTime)

    const now = audioContext.currentTime
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume * 6.0, now + 0.008) 
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

    mainOsc.connect(gainNode)
    bodyOsc.connect(gainNode)
    gainNode.connect(filter)

    return { oscillator: mainOsc, gainNode, soundType: 'amber', extraOscillators: [bodyOsc] }
  }

  scheduleSound(sound: { oscillator: OscillatorNode, gainNode: GainNode, soundType: SoundType, extraOscillators?: OscillatorNode[] }, time: number, masterGain: GainNode): void {
    const { oscillator, gainNode, soundType, extraOscillators } = sound

    try {
      // Connect the gain node to the master gain
      gainNode.disconnect() // Disconnect from any previous connection
      gainNode.connect(masterGain)

      // Start the main oscillator at the scheduled time
      oscillator.start(time)

      // Start any extra oscillators (for sounds like Bell and Amber)
      if (extraOscillators) {
        extraOscillators.forEach(extraOsc => extraOsc.start(time))
      }

      // Calculate duration based on the actual sound type
      let duration = 0.1
      switch (soundType) {
        case 'woodblock':
          duration = 0.045
          break
        case 'click':
          duration = 0.027
          break
        case 'doublePulse':
          duration = 0.030 // Total duration for double pulse
          break
        case 'bell':
          duration = 0.1
          break
        case 'amber':
          duration = 0.068
          break
        default:
          duration = 0.1
      }

      // Safety stop for main oscillator
      oscillator.stop(time + duration)

      // Safety stop for extra oscillators
      if (extraOscillators) {
        extraOscillators.forEach(extraOsc => extraOsc.stop(time + duration))
      }
    } catch (error) {
      console.warn('Error scheduling sound:', error)
    }
  }

  setVolume(gainNode: GainNode, volume: number): void {
    if (gainNode) {
      // Apply the 3.0x boost here as well, otherwise setting volume resets the boost
      gainNode.gain.setValueAtTime(volume * 3.0, this.audioContext?.currentTime || 0)
    }
  }
}