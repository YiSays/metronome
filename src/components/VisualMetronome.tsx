import React, { useEffect, useRef, useState } from 'react'

interface VisualMetronomeProps {
  isPlaying: boolean
  bpm: number
  timeSignature: { beatsPerMeasure: number; beatUnit: 4 | 8 }
  onCurrentBeatChange?: (beatIndex: number) => void
}

const VisualMetronome: React.FC<VisualMetronomeProps> = ({
  isPlaying,
  bpm,
  timeSignature,
  onCurrentBeatChange
}) => {
  const [visualBeat, setVisualBeat] = useState(0)
  const animationRef = useRef<number>()
  const lastBeatRef = useRef<number>(0)

  useEffect(() => {
    if (!isPlaying) {
      setVisualBeat(0)
      return
    }

    const beatDuration = (60 / bpm) * 1000 // in milliseconds
    const now = Date.now()

    // Calculate current position in the measure
    const elapsed = now - lastBeatRef.current
    const currentPosition = (elapsed / beatDuration) % timeSignature.beatsPerMeasure

    setVisualBeat(currentPosition)

    const animate = () => {
      if (!isPlaying) return

      const now = Date.now()
      const elapsed = now - lastBeatRef.current
      const position = (elapsed / beatDuration) % timeSignature.beatsPerMeasure

      setVisualBeat(position)

      // Notify parent of current beat change
      const currentBeatIndex = Math.floor(position)
      if (onCurrentBeatChange) {
        onCurrentBeatChange(currentBeatIndex)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    lastBeatRef.current = now
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, bpm, timeSignature])

  const beats = Array.from({ length: timeSignature.beatsPerMeasure }, (_, i) => i + 1)
  const currentBeatIndex = Math.floor(visualBeat)

  return (
    <div className="visual-metronome">
      <div className="beat-dots-container">
        {beats.map((beatNumber) => {
          const isDownbeat = beatNumber === 1
          const isCurrent = beatNumber === currentBeatIndex + 1
          const isNext = beatNumber === (currentBeatIndex + 1) % timeSignature.beatsPerMeasure + 1

          return (
            <div
              key={beatNumber}
              className={`beat-dot ${isDownbeat ? 'downbeat' : 'beat'} ${
                isCurrent ? 'active' : isNext ? 'next' : ''
              }`}
              style={{
                animationDuration: `${60 / bpm}s`
              }}
            >
              <div className={`dot-inner ${isDownbeat ? 'downbeat-inner' : ''}`}></div>
            </div>
          )
        })}
      </div>

      {isPlaying && (
        <div className="metronome-shadow">
          <div
            className="shadow-pulse"
            style={{
              animation: `pulse ${60 / bpm}s infinite`
            }}
          ></div>
        </div>
      )}
    </div>
  )
}

export default VisualMetronome