import { useState } from 'react'
import { useMetronome } from './hooks/useMetronome'
import { Preset, PresetManager } from './utils/presets'
import './App.css'
import MetronomeControls from './components/MetronomeControls'
import VisualMetronome from './components/VisualMetronome'
import PresetManagerComponent from './components/PresetManager'
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

  const [currentPreset, setCurrentPreset] = useState<Preset | null>(null)
  const [activeTab, setActiveTab] = useState<'controls' | 'presets' | 'tap'>('controls')
  const [isTapActive, setIsTapActive] = useState(false)
  const [tapTimes, setTapTimes] = useState<number[]>([])

  const handlePresetSelect = (preset: Preset) => {
    setBpm(preset.bpm)
    setTimeSignature(preset.timeSignature)
    setSoundType(preset.soundType)
    setVolume(preset.volume)
    setCurrentPreset(preset)
  }

  const handleSavePreset = (preset: Preset) => {
    // Update preset with current state
    const updatedPreset = {
      ...preset,
      bpm,
      timeSignature: {
        beatsPerMeasure: timeSignature.beatsPerMeasure,
        beatUnit: timeSignature.beatUnit as 4 | 8
      },
      soundType,
      volume
    }
    PresetManager.savePreset(updatedPreset)
    setCurrentPreset(updatedPreset)
  }

  const handleDeletePreset = (id: string) => {
    PresetManager.deletePreset(id)
    if (currentPreset?.id === id) {
      setCurrentPreset(null)
    }
  }

  const handleResetPresets = () => {
    PresetManager.resetToDefaults()
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
    setCurrentPreset(null) // Clear preset selection when BPM changes manually
  }

  return (
    <div className="app">
      <aside className="app-sidebar">
        <div className="app-title">Metronome</div>
        <nav className="app-nav">
          <button
            className={`nav-btn ${activeTab === 'controls' ? 'active' : ''}`}
            onClick={() => setActiveTab('controls')}
          >
            🎼 Controls
          </button>
          <button
            className={`nav-btn ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => setActiveTab('presets')}
          >
            📋 Presets
          </button>
          <button
            className={`nav-btn ${activeTab === 'tap' ? 'active' : ''}`}
            onClick={() => setActiveTab('tap')}
          >
            👆 Tap Tempo
          </button>
        </nav>
        <div className="volume-control">
          <div className="volume-label">Volume</div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="volume-slider-sidebar"
          />
        </div>
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
                  onTimeSignatureChange={setTimeSignature}
                  soundType={soundType}
                  onSoundTypeChange={setSoundType}
                  volume={volume}
                  onVolumeChange={setVolume}
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

        {activeTab === 'presets' && (
          <div className="presets-container">
            <PresetManagerComponent
              currentPreset={currentPreset}
              onPresetSelect={handlePresetSelect}
              onSavePreset={handleSavePreset}
              onDeletePreset={handleDeletePreset}
              onResetPresets={handleResetPresets}
            />
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