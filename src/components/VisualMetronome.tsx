import React, { useEffect, useRef, useState } from 'react'

interface VisualMetronomeProps {
  isPlaying: boolean
  bpm: number
  timeSignature: { beatsPerMeasure: number; beatUnit: 4 | 8 }
  onCurrentBeatChange?: (beatIndex: number) => void
  scheduledBeatsRef?: React.MutableRefObject<Array<{ time: number, beatIndex: number }>>
  getAudioTime?: () => number
}

const VisualMetronome: React.FC<VisualMetronomeProps> = ({
  isPlaying,
  bpm,
  timeSignature,
  onCurrentBeatChange,
  scheduledBeatsRef,
  getAudioTime
}) => {
  const [visualBeat, setVisualBeat] = useState(0)
  const animationRef = useRef<number>()
  const lastBeatRef = useRef<number>(0)
  const lastBeatIndexRef = useRef<number>(-1)

  useEffect(() => {
    if (!isPlaying) {
      setVisualBeat(0)
      lastBeatIndexRef.current = -1
      return
    }

    const animate = () => {
      if (!isPlaying) return

      let currentTime = 0
      
      // Sync Logic: If we have access to audio context time, use it
      if (getAudioTime && scheduledBeatsRef && scheduledBeatsRef.current.length > 0) {
        currentTime = getAudioTime()
        const queue = scheduledBeatsRef.current
        
        // Check if any scheduled beat is due (or slightly past)
        // We use a small window to catch beats that happened between frames
        while (queue.length > 0 && queue[0].time <= currentTime + 0.02) { 
           const nextBeat = queue.shift()
           if (nextBeat) {
             lastBeatRef.current = nextBeat.time
             lastBeatIndexRef.current = nextBeat.beatIndex
             
             // Trigger immediate update
             setVisualBeat(nextBeat.beatIndex)
             if (onCurrentBeatChange) {
               onCurrentBeatChange(nextBeat.beatIndex)
             }
           }
        }
      } else {
         // Fallback to purely visual estimation if audio hasn't started or refs missing
         // (This helps initial render or if audio is suspended)
         // Note: We might want to avoid this if we are strictly syncing
      }

      // Smooth interpolation for the "filling" effect if needed, 
      // but for discrete dots, we just want the index. 
      // If we used the smooth progress bar, we'd calculate:
      // const progress = (currentTime - lastBeatRef.current) / beatDuration
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, bpm, timeSignature, getAudioTime, scheduledBeatsRef])

  // The component is now logic-only for sync; visuals are handled by the Dial via onCurrentBeatChange
  return null
}

export default VisualMetronome