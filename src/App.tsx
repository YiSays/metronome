import { useState, useEffect, useCallback, useMemo } from 'react'
import { useMetronome } from './hooks/useMetronome'
import { Preset, defaultPresets } from './utils/presets'
import './App.css'
import VisualMetronome from './components/VisualMetronome'
import BpmDial from './components/BpmDial'
import SettingsDrawer from './components/SettingsDrawer'
import TimeSignatureControl from './components/TimeSignatureControl'

function App() {
  const {
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
    toggle,
    initializeAudio,
    scheduledBeatsRef,
    getAudioTime
  } = useMetronome()

  const [presets, setPresets] = useState<Preset[]>(defaultPresets)
  const [activePresetId, setActivePresetId] = useState<string>(defaultPresets[0].id)
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Visual Beat Tracking in App State
  const [currentBeat, setCurrentBeat] = useState(-1);

  // Tap Tempo Logic
  const [tapTimes, setTapTimes] = useState<number[]>([])
  const [tapBpm, setTapBpm] = useState<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      setCurrentBeat(-1);
    }
  }, [isPlaying]);

  useEffect(() => {
    const firstPreset = defaultPresets[0]
    setBpm(firstPreset.bpm)
    setTimeSignature(firstPreset.timeSignature)
    setSoundType(firstPreset.soundType)
    setVolume(firstPreset.volume)
  }, [])

  // Sync TS control to presets update
  useEffect(() => {
     // If active preset changes, we are already updating state via handlePresetSelect
     // But if we change TS manually, we need to make sure UI stays in sync.
     // The TimeSignatureControl uses the 'timeSignature' from useMetronome hook, which is correct.
  }, [timeSignature])

  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (!preset) return

    setActivePresetId(presetId)
    setBpm(preset.bpm)
    setTimeSignature(preset.timeSignature)
    setSoundType(preset.soundType)
    setVolume(preset.volume)
    // Apply preset params if they exist, otherwise clear params
    setSoundParams(preset.params || {})
  };

  const updateActivePreset = (updates: Partial<Preset>) => {
    setPresets(prevPresets => 
      prevPresets.map((p, index) => {
        if (p.id === activePresetId) {
           const updatedPreset = { ...p, ...updates };
           
           // Check against default
           const original = defaultPresets.find(dp => dp.id === p.id);
           let newName = updatedPreset.name;
           
           if (original) {
              const isMatch = (
                updatedPreset.bpm === original.bpm &&
                updatedPreset.soundType === original.soundType &&
                Math.abs(updatedPreset.volume - original.volume) < 0.001 &&
                updatedPreset.timeSignature.beatsPerMeasure === original.timeSignature.beatsPerMeasure &&
                updatedPreset.timeSignature.beatUnit === original.timeSignature.beatUnit
              );
              
              if (isMatch) {
                 newName = original.name;
              } else {
                 newName = `Custom ${index + 1}`;
              }
           }
           
           return { ...updatedPreset, name: newName };
        }
        return p;
      })
    )
  }

  const handleBpmChange = (newBpm: number) => {
    if (newBpm < 40 || newBpm > 240 || isNaN(newBpm)) return;
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
  
  const handleTap = () => {
    const now = Date.now();
    let newTimes = [...tapTimes];
    if (newTimes.length > 0 && now - newTimes[newTimes.length - 1] > 2000) {
      newTimes = [];
    }
    
    newTimes.push(now);
    if (newTimes.length > 5) newTimes.shift();
    setTapTimes(newTimes);
    
    if (newTimes.length > 1) {
       const intervals = newTimes.slice(1).map((time, i) => time - newTimes[i]);
       const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
       const calculatedBpm = Math.round(60000 / avgInterval);
       
       if (calculatedBpm >= 40 && calculatedBpm <= 240) {
         setTapBpm(calculatedBpm);
         handleBpmChange(calculatedBpm);
       }
    }
  };

  // Callback from VisualMetronome to track beat for Dial flash
  const handleBeatChange = useCallback((beatIndex: number) => {
    setCurrentBeat(beatIndex);
  }, []);

  const visualTimeSignature = useMemo(() => ({
    ...timeSignature,
    beatUnit: timeSignature.beatUnit as 4 | 8
  }), [timeSignature]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">Metronome</div>
        <button 
          className="menu-btn"
          onClick={() => setIsSettingsOpen(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </header>

      <main className="app-main">
        <div className="main-visuals">
          <VisualMetronome
            isPlaying={isPlaying}
            bpm={bpm}
            timeSignature={visualTimeSignature}
            onCurrentBeatChange={handleBeatChange}
            scheduledBeatsRef={scheduledBeatsRef}
            getAudioTime={getAudioTime}
          />
        </div>

        <BpmDial 
          bpm={bpm}
          min={40}
          max={240}
          onChange={handleBpmChange}
          isPlaying={isPlaying}
          onTogglePlay={() => {
            initializeAudio(); 
            toggle();
          }}
          currentBeat={currentBeat}
        />

        <TimeSignatureControl 
          timeSignature={timeSignature}
          onChange={handleTimeSignatureChange}
        />
        
        <div className={`tap-indicator-overlay ${tapTimes.length > 0 && (Date.now() - tapTimes[tapTimes.length-1] < 500) ? 'active' : ''}`}>
           <div style={{ color: 'white', fontWeight: 'bold' }}>TAPPING...</div>
        </div>

      </main>

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        presets={presets}
        activePresetId={activePresetId}
        onSelectPreset={handlePresetSelect}
        volume={volume}
        onVolumeChange={(vol) => {
          setVolume(vol);
          updateActivePreset({ volume: vol });
        }}
        bpm={bpm}
        onBpmChange={handleBpmChange}
        timeSignature={timeSignature}
        onTimeSignatureChange={handleTimeSignatureChange}
        soundType={soundType}
        onSoundTypeChange={(type) => {
          setSoundType(type);
          updateActivePreset({ soundType: type });
        }}
        soundParams={soundParams}
        onSoundParamsChange={(params) => {
          setSoundParams(params);
          updateActivePreset({ params });
        }}
        onTapTempo={handleTap}
        isTapActive={false}
        tapBpm={tapBpm}
      />
    </div>
  )
}

export default App