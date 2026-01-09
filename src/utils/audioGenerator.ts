import { AudioContextState, BeatPattern, SoundType } from '../types'

export class AudioGenerator {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private isInitialized = false

  async initialize(): Promise<AudioContextState> {
    if (this.audioContext) {
      return { audioContext: this.audioContext, masterGain: this.masterGain, isInitialized: this.isInitialized }
    }

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      // Set initial volume to current volume setting
      this.masterGain.gain.value = 0.5
      this.masterGain.connect(this.audioContext.destination)
      this.isInitialized = true

      return { audioContext: this.audioContext, masterGain: this.masterGain, isInitialized: this.isInitialized }
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
      return { audioContext: null, masterGain: null, isInitialized: false }
    }
  }

  createBeatPattern(_audioContext: AudioContext, soundType: SoundType, _volume: number = 0.5): BeatPattern {
    // Store the sound types, not the actual sound objects
    // We'll create new oscillators for each beat since they can only be started once
    return { downbeat: soundType, beat: soundType }
  }

  public createSound(audioContext: AudioContext, soundType: SoundType, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: SoundType, extraOscillators?: OscillatorNode[] } {
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
    // Connect the gain node to the master gain
    gainNode.disconnect() // Disconnect from any previous connection
    gainNode.connect(masterGain)
  }

  // 1. WOODBLOCK - Warm, percussive, wood-like
  private createWoodblockSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'woodblock' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    // Warm woodblock frequency
    const frequency = isDownbeat ? 1200 : 1000
    const duration = isDownbeat ? 0.045 : 0.035

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)

    // Percussive envelope with quick attack for wood-like character
    const now = audioContext.currentTime
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume * 3.2, now + 0.005) // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration) // Quick decay

    oscillator.connect(gainNode)

    return { oscillator, gainNode, soundType: 'woodblock' }
  }

  // 2. MODERN CLICK - Clean, precise, professional
  private createClickSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'click' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    // Higher frequencies for modern click
    const frequency = isDownbeat ? 2000 : 1600
    const duration = isDownbeat ? 0.027 : 0.02

    // Use square for sharp attack, but quickly envelope to avoid harshness
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)

    const now = audioContext.currentTime
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume * 2.8, now + 0.002) // Ultra-quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration) // Fast decay

    oscillator.connect(gainNode)

    return { oscillator, gainNode, soundType: 'click' }
  }

  // 3. DOUBLE PULSE - Traditional pendulum style
  private createDoublePulseSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'doublePulse' } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    const frequency = 1000
    const now = audioContext.currentTime

    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(frequency, now)

    // For downbeat: two pulses (tick...tock)
    // For regular: single pulse
    if (isDownbeat) {
      // Two pulses with small gap
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(volume * 2.2, now + 0.002)  // First pulse
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.008)
      gainNode.gain.setValueAtTime(0, now + 0.020)
      gainNode.gain.linearRampToValueAtTime(volume * 2.2, now + 0.022)  // Second pulse
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.030)
    } else {
      // Single pulse
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(volume * 2.2, now + 0.002)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.010)
    }

    oscillator.connect(gainNode)

    return { oscillator, gainNode, soundType: 'doublePulse' }
  }

  // 4. BELL - Musical, pleasant, redesigned
  private createBellSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'bell', extraOscillators: OscillatorNode[] } {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const harmonicOsc = audioContext.createOscillator()
    const harmonicGain = audioContext.createGain()

    // Musical intervals for bell-like character
    const baseFrequency = isDownbeat ? 880 : 660 // A5 and F5 (perfect fourth apart)
    const duration = isDownbeat ? 0.08 : 0.06

    // Main tone
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(baseFrequency, audioContext.currentTime)

    // Stronger harmonic for presence (30% vs 15%)
    harmonicOsc.type = 'sine'
    harmonicOsc.frequency.setValueAtTime(baseFrequency * 2, audioContext.currentTime)
    harmonicGain.gain.setValueAtTime(volume * 0.35, audioContext.currentTime)

    // Punchier envelope - faster attack, higher peak
    const now = audioContext.currentTime
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume * 4.0, now + 0.005) // Much higher peak
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration) // Shorter decay for punch

    // Harmonic boosted for more presence
    harmonicGain.gain.setValueAtTime(volume * 1.2, audioContext.currentTime)

    // Connect both
    oscillator.connect(gainNode)
    harmonicOsc.connect(harmonicGain)
    harmonicGain.connect(gainNode)

    return { oscillator, gainNode, soundType: 'bell', extraOscillators: [harmonicOsc] }
  }

  // 5. AMBER - Full-bodied "thock" sound (renamed Custom)
  private createAmberSound(audioContext: AudioContext, volume: number, isDownbeat: boolean): { oscillator: OscillatorNode, gainNode: GainNode, soundType: 'amber', extraOscillators: OscillatorNode[] } {
    const mainOsc = audioContext.createOscillator()
    const bodyOsc = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    const baseFrequency = isDownbeat ? 880 : 800 // Slightly higher for downbeat
    const duration = isDownbeat ? 0.068 : 0.055

    // Main click (higher frequency)
    mainOsc.type = 'square'
    mainOsc.frequency.setValueAtTime(baseFrequency, audioContext.currentTime)

    // Body tone (lower frequency for weight)
    bodyOsc.type = 'triangle'
    bodyOsc.frequency.setValueAtTime(350, audioContext.currentTime)

    // Gentle lowpass to blend layers
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2000, audioContext.currentTime)
    filter.Q.setValueAtTime(0.8, audioContext.currentTime)

    // Combined envelope - boosted for presence
    const now = audioContext.currentTime
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume * 3.0, now + 0.008) // Boosted attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration) // Smooth decay

    // Connect layers
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
      gainNode.gain.setValueAtTime(volume, this.audioContext?.currentTime || 0)
    }
  }
}