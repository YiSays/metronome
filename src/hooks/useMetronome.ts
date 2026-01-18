import { useState, useRef, useEffect, useCallback } from 'react'
import { AudioGenerator } from '../utils/audioGenerator'
import { TimeSignature, SoundType, SoundParams } from '../types'

export const useMetronome = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [timeSignature, setTimeSignature] = useState<TimeSignature>({ beatsPerMeasure: 4, beatUnit: 4 })
  const [soundType, setSoundType] = useState<SoundType>('hollowWood')
  const [volume, setVolume] = useState(0.5)
  const [soundParams, setSoundParams] = useState<SoundParams>({})

  const audioGenerator = useRef(new AudioGenerator())
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const isInitializedRef = useRef(false)
  const nextNoteTimeRef = useRef(0)
  const measureStartTimeRef = useRef(0)
  const scheduleAheadTimeRef = useRef(0.1)
  const rafTimerRef = useRef<number | null>(null)
  const beatPatternRef = useRef<any>(null)

  // Queue for visual synchronization
  // Stores { time: number, beatIndex: number }
  const scheduledBeatsRef = useRef<Array<{ time: number, beatIndex: number }>>([])

  const initializeAudio = useCallback(async () => {
    if (isInitializedRef.current) return

    const { audioContext, masterGain, isInitialized } = await audioGenerator.current.initialize()
    if (audioContext && masterGain) {
      audioContextRef.current = audioContext
      masterGainRef.current = masterGain
      isInitializedRef.current = isInitialized

      // Create initial beat pattern
      beatPatternRef.current = audioGenerator.current.createBeatPattern(audioContext, soundType, volume)

      // Set the current volume on the master gain
      audioGenerator.current.setVolume(masterGain, volume)
    }
  }, [soundType, volume])

  const nextNote = useCallback(() => {
    const secondsPerBeat = 60.0 / bpm
    nextNoteTimeRef.current += secondsPerBeat
  }, [bpm])

  const scheduleNote = useCallback((beatNumber: number, time: number) => {
    if (!audioContextRef.current || !masterGainRef.current || !beatPatternRef.current) return

    const { downbeat, beat } = beatPatternRef.current
    const isDownbeat = beatNumber === 0

    // For each beat, we need to create a new oscillator instance
    // because oscillators can only be started once
    const currentSoundType = isDownbeat ? downbeat : beat

    // Sound generation methods handle volume differentiation internally
    // Pass soundParams for enhanced sound control
    const newSound = audioGenerator.current.createSound(audioContextRef.current, currentSoundType, volume, isDownbeat, soundParams)

    // Schedule the sound
    audioGenerator.current.scheduleSound(newSound, time, masterGainRef.current)

    // Push to visual queue
    scheduledBeatsRef.current.push({ time, beatIndex: beatNumber })

    // Limit queue size to prevent memory leaks (though it should be consumed)
    if (scheduledBeatsRef.current.length > 50) {
       scheduledBeatsRef.current.shift()
    }
  }, [volume, soundParams])

  const scheduler = useCallback(() => {
    if (!audioContextRef.current || !beatPatternRef.current) return

    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + scheduleAheadTimeRef.current) {
      const beatsPerMeasure = timeSignature.beatsPerMeasure
      const beatDuration = 60 / bpm

      // Calculate which beat in the measure this is based on measure start time
      const timeSinceMeasureStart = nextNoteTimeRef.current - measureStartTimeRef.current
      const totalBeats = timeSinceMeasureStart / beatDuration
      const beatIndex = Math.floor(totalBeats) % beatsPerMeasure

      scheduleNote(beatIndex, nextNoteTimeRef.current)
      nextNote()
    }

    rafTimerRef.current = requestAnimationFrame(scheduler)
  }, [timeSignature, bpm, scheduleNote, nextNote])

  const start = useCallback(async () => {
    await initializeAudio()
    if (!audioContextRef.current || !masterGainRef.current) return

    setIsPlaying(true)

    // Set measure start time for proper downbeat alignment
    if (audioContextRef.current) {
      measureStartTimeRef.current = audioContextRef.current.currentTime
      nextNoteTimeRef.current = measureStartTimeRef.current + 0.05
    } else {
      nextNoteTimeRef.current = 0
    }

    // Resume audio context if suspended
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    rafTimerRef.current = requestAnimationFrame(scheduler)
  }, [initializeAudio, scheduler])

  const stop = useCallback(() => {
    setIsPlaying(false)
    if (rafTimerRef.current) {
      cancelAnimationFrame(rafTimerRef.current)
      rafTimerRef.current = null
    }
  }, [])

  const toggle = useCallback(async () => {
    if (isPlaying) {
      stop()
    } else {
      await start()
    }
  }, [isPlaying, start, stop])

  // Update beat pattern when sound type or volume changes
  useEffect(() => {
    if (audioContextRef.current && masterGainRef.current) {
      beatPatternRef.current = audioGenerator.current.createBeatPattern(
        audioContextRef.current,
        soundType,
        volume
      )
      audioGenerator.current.setVolume(masterGainRef.current, volume)

      // Also update individual sound volume if playing
      if (isPlaying) {
        // The volume will be applied to new sounds created
      }
    }
  }, [soundType, volume, bpm])

  // Restart scheduler when bpm, sound type, or time signature changes while playing
  useEffect(() => {
    if (isPlaying && rafTimerRef.current) {
      // Cancel current animation frame and restart
      cancelAnimationFrame(rafTimerRef.current)

      // Reset timing to ensure downbeat alignment
      if (audioContextRef.current) {
        // Reset to next downbeat to maintain proper alignment
        measureStartTimeRef.current = audioContextRef.current.currentTime
        nextNoteTimeRef.current = measureStartTimeRef.current + 0.05
      } else {
        nextNoteTimeRef.current = 0
      }

      rafTimerRef.current = requestAnimationFrame(scheduler)
    }
  }, [bpm, soundType, timeSignature, isPlaying])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (rafTimerRef.current) {
        cancelAnimationFrame(rafTimerRef.current)
      }
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close()
      }
    }
  }, [])

  const getAudioTime = useCallback(() => {
    return audioContextRef.current?.currentTime || 0
  }, [])

  return {
    isPlaying,
    bpm,
    timeSignature,
    soundType,
    volume,
    soundParams,
    setBpm,
    setTimeSignature,
    setSoundType,
    setVolume,
    setSoundParams,
    start,
    stop,
    toggle,
    initializeAudio,
    scheduledBeatsRef, // Expose for visual sync
    getAudioTime       // Expose for visual sync
  }
}