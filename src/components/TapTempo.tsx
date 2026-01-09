import React, { useState, useRef, useEffect } from 'react'

interface TapTempoProps {
  onBpmChange: (bpm: number) => void
  currentBpm: number
  isActive: boolean
  onToggle: () => void
}

const TapTempo: React.FC<TapTempoProps> = ({
  onBpmChange,
  currentBpm,
  isActive,
  onToggle
}) => {
  const [tapTimes, setTapTimes] = useState<number[]>([])
  const [lastTap, setLastTap] = useState<number>(0)
  const [calculatedBpm, setCalculatedBpm] = useState<number | null>(null)
  const [isTapping, setIsTapping] = useState(false)
  const tapButtonRef = useRef<HTMLButtonElement>(null)

  const handleTap = () => {
    if (!isActive) return

    const now = performance.now()
    setIsTapping(true)

    if (tapTimes.length === 0) {
      setTapTimes([now])
      setLastTap(now)
    } else {
      const times = [...tapTimes, now].slice(-8) // Keep last 8 taps for accuracy
      setTapTimes(times)

      if (times.length > 1) {
        const intervals = times.slice(1).map((time, i) => time - times[i])
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
        const calculatedBpm = Math.round(60000 / avgInterval)

        if (calculatedBpm > 40 && calculatedBpm < 240) {
          setCalculatedBpm(calculatedBpm)
          onBpmChange(calculatedBpm)
        }
      }
    }

    // Reset tapping animation
    setTimeout(() => setIsTapping(false), 100)
  }

  // Reset tap times after 2 seconds of inactivity
  useEffect(() => {
    if (tapTimes.length > 0) {
      const timer = setTimeout(() => {
        if (Date.now() - lastTap > 2000) {
          setTapTimes([])
          setCalculatedBpm(null)
        }
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [tapTimes, lastTap])

  const getTapStatus = () => {
    if (tapTimes.length === 0) return 'Start tapping to detect tempo'
    if (tapTimes.length === 1) return 'Keep tapping for accuracy...'
    if (calculatedBpm) return `Detected: ${calculatedBpm} BPM`
    return `${tapTimes.length} taps recorded`
  }

  return (
    <div className="tap-tempo">
      <div className="tap-tempo-header">
        <h3>Tap Tempo</h3>
        <button
          onClick={onToggle}
          className={`toggle-btn ${isActive ? 'active' : ''}`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </button>
      </div>

      <div className="tap-controls">
        <div className="tap-button-container">
          <button
            ref={tapButtonRef}
            onClick={handleTap}
            disabled={!isActive}
            className={`tap-button ${isTapping ? 'tapping' : ''} ${isActive ? 'enabled' : 'disabled'}`}
            aria-label="Tap to set tempo"
          >
            <div className="tap-icon">
              <div className="tap-circle">
                <div className="tap-dot"></div>
              </div>
            </div>
            <span className="tap-label">Tap</span>
          </button>
        </div>

        <div className="tap-info">
          <div className="current-bpm">
            Current: {currentBpm} BPM
          </div>
          <div className="tap-status">
            {getTapStatus()}
          </div>
          <div className="tap-tips">
            <small>Tip: Tap 4-8 times for best accuracy</small>
          </div>
        </div>
      </div>

      {tapTimes.length > 0 && (
        <div className="tap-history">
          <div className="history-label">Recent taps:</div>
          <div className="tap-intervals">
            {tapTimes.slice(1).map((time, i) => {
              const interval = time - tapTimes[i]
              return (
                <span key={i} className="interval">
                  {Math.round(interval)}ms
                </span>
              )
            })}
          </div>
        </div>
      )}

      <div className="tap-instructions">
        <h4>How to use:</h4>
        <ol>
          <li>Enable Tap Tempo mode</li>
          <li>Tap the button in time with your desired tempo</li>
          <li>The metronome will automatically update to match your tapping</li>
          <li>Use 4-8 taps for the most accurate results</li>
        </ol>
      </div>
    </div>
  )
}

export default TapTempo