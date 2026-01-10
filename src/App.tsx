import { useState, useEffect } from 'react'
import { useMetronome } from './hooks/useMetronome'
import { Preset, defaultPresets } from './utils/presets'
import './App.css'
import MetronomeControls from './components/MetronomeControls'
import VisualMetronome from './components/VisualMetronome'
import TapTempo from './components/TapTempo'

function App() {
  const {
    isPlaying,
    bpm,
    timeSignature,
    soundType,
    volume,
    setBpm,
    setTimeSignature,
    setSoundType,
    setVolume,
    start,
    stop,
    toggle,
    initializeAudio
  } = useMetronome()

  // Initialize presets state from defaultPresets (in-memory only for this session)
  const [presets, setPresets] = useState<Preset[]>(defaultPresets)
  const [activePresetId, setActivePresetId] = useState<string>(defaultPresets[0].id)
  
  const [activeTab, setActiveTab] = useState<'controls' | 'tap'>('controls')
  const [isTapActive, setIsTapActive] = useState(false)
  const [tapTimes, setTapTimes] = useState<number[]>([])

  // Initialize metronome with the first preset's settings on mount
  useEffect(() => {
    const firstPreset = defaultPresets[0]
    setBpm(firstPreset.bpm)
    setTimeSignature(firstPreset.timeSignature)
    setSoundType(firstPreset.soundType)
    setVolume(firstPreset.volume)
  }, []) // Empty dependency array means this runs once on mount

  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (!preset) return

    setActivePresetId(presetId)
    
    // Update metronome settings
    setBpm(preset.bpm)
    setTimeSignature(preset.timeSignature)
    setSoundType(preset.soundType)
    setVolume(preset.volume)
  }

  // Generic helper to update the active preset when a setting changes
  const updateActivePreset = (updates: Partial<Preset>) => {
    setPresets(prevPresets => 
      prevPresets.map(p => 
        p.id === activePresetId 
          ? { ...p, ...updates } 
          : p
      )
    )
  }

  const handleTapTempoToggle = () => {
    setIsTapActive(!isTapActive)
    if (!isTapActive) {
      // Initialize audio when tap tempo is enabled
      initializeAudio()
    }
  }

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm)
    updateActivePreset({ bpm: newBpm })
  }

  const handleTimeSignatureChange = (newTimeSignature: { beatsPerMeasure: number; beatUnit: number }) => {
    setTimeSignature(newTimeSignature)
    updateActivePreset({ 
      timeSignature: { 
        beatsPerMeasure: newTimeSignature.beatsPerMeasure, 
        beatUnit: newTimeSignature.beatUnit as 4 | 8 
      } 
    })
  }

  const handleSoundTypeChange = (newSoundType: 'woodblock' | 'click' | 'doublePulse' | 'bell' | 'amber') => {
    setSoundType(newSoundType)
    updateActivePreset({ soundType: newSoundType })
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    updateActivePreset({ volume: newVolume })
  }

  return (
    <div className="app">
      <aside className="app-sidebar">
        <div className="app-title">Metronome</div>
        
        <div className="sidebar-section">
          <div className="sidebar-header">Presets</div>
          <p className="sidebar-hint">Customize up to 6 songs. Your changes stay until you refresh.</p>
          <div className="preset-list-sidebar">
            {presets.map(preset => (
              <button
                key={preset.id}
                className={`preset-btn-sidebar ${activePresetId === preset.id ? 'active' : ''}`}
                onClick={() => handlePresetSelect(preset.id)}
              >
                <div className="preset-name">{preset.name}</div>
                <div className="preset-info-mini">
                  {preset.bpm} BPM • {preset.timeSignature.beatsPerMeasure}/{preset.timeSignature.beatUnit}
                </div>
              </button>
            ))}
          </div>
        </div>

        <nav className="app-nav">
          <button
            className={`nav-btn ${activeTab === 'controls' ? 'active' : ''}`}
            onClick={() => setActiveTab('controls')}
          >
            🎼 Controls
          </button>
          <button
            className={`nav-btn ${activeTab === 'tap' ? 'active' : ''}`}
            onClick={() => setActiveTab('tap')}
          >
            👆 Tap Tempo
          </button>
        </nav>
      </aside>

      <main className="app-main">
        {activeTab === 'controls' && (
          <div className="metronome-container">
            <VisualMetronome
              isPlaying={isPlaying}
              bpm={bpm}
              timeSignature={{
                beatsPerMeasure: timeSignature.beatsPerMeasure,
                beatUnit: timeSignature.beatUnit as 4 | 8
              }}
            />
            <div className="metronome-layout">
              <div className="tap-section">
                <button
                  onClick={() => {
                    const now = Date.now()
                    if (tapTimes.length === 0) {
                      setTapTimes([now])
                    } else {
                      const times = [...tapTimes, now].slice(-8)
                      setTapTimes(times)
                      if (times.length > 1) {
                        const intervals = times.slice(1).map((time, i) => time - times[i])
                        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
                        const calculatedBpm = Math.round(60000 / avgInterval)
                        if (calculatedBpm > 40 && calculatedBpm < 240) {
                          handleBpmChange(calculatedBpm)
                        }
                      }
                    }
                  }}
                  className="tap-tempo-btn"
                  disabled={isPlaying}
                >
                  Tap Tempo
                </button>
              </div>
              <div className="control-section">
                <MetronomeControls
                  onPlay={start}
                  onPause={stop}
                  isPlaying={isPlaying}
                  bpm={bpm}
                  onBpmChange={handleBpmChange}
                  timeSignature={timeSignature}
                  onTimeSignatureChange={handleTimeSignatureChange}
                  soundType={soundType}
                  onSoundTypeChange={handleSoundTypeChange}
                  volume={volume}
                  onVolumeChange={handleVolumeChange}
                />
              </div>
              <div className="play-section">
                <button
                  onClick={isPlaying ? stop : start}
                  className={`play-btn ${isPlaying ? 'pause' : 'play'}`}
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tap' && (
          <div className="tap-container">
            <TapTempo
              onBpmChange={handleBpmChange}
              currentBpm={bpm}
              isActive={isTapActive}
              onToggle={handleTapTempoToggle}
            />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-info">
          <span>Web Audio API • Sample-accurate timing</span>
          <span>• Built with React & Vite</span>
        </div>
        <div className="footer-actions">
          <button
            onClick={() => {
              // Initialize audio context on user interaction
              initializeAudio()
            }}
            className="init-audio-btn"
          >
            Audio
          </button>
          {isPlaying && (
            <button onClick={toggle} className="stop-all-btn">
              Stop
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

export default App