import React, { useState } from 'react';
import { Preset } from '../utils/presets';
import { SoundParams } from '../types';
import { COMMON_TIME_SIGNATURES } from '../utils/constants';
import './SettingsDrawer.css';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Preset[];
  activePresetId: string;
  onSelectPreset: (id: string) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  timeSignature: { beatsPerMeasure: number; beatUnit: number };
  onTimeSignatureChange: (ts: { beatsPerMeasure: number; beatUnit: number }) => void;
  soundType: string;
  onSoundTypeChange: (type: any) => void;
  soundParams: SoundParams;
  onSoundParamsChange: (params: SoundParams) => void;
  onTapTempo: () => void;
  isTapActive: boolean;
  tapBpm: number | null;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  presets,
  activePresetId,
  onSelectPreset,
  volume,
  onVolumeChange,
  bpm,
  onBpmChange,
  timeSignature,
  onTimeSignatureChange,
  soundType,
  onSoundTypeChange,
  soundParams,
  onSoundParamsChange,
  onTapTempo
}) => {
  // Calculate VU meter level based on volume
  const vuLevel = Math.round(volume * 10);

  // Fine Tune section state
  const [isFineTuneOpen, setIsFineTuneOpen] = useState(false);

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="rack-title">
            <span className="rack-title-text">RACK UNIT 01</span>
            <span className="rack-indicator"></span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="drawer-content">
          {/* Tempo Control Panel */}
          <section className="drawer-section rack-panel">
            <div className="rack-panel-header">
              <h3>TEMPO CONTROL</h3>
              <span className="panel-led"></span>
            </div>
            <div className="drawer-bpm-control">
              <div className="bpm-display">
                <span className="bpm-value">{bpm}</span>
                <span className="bpm-label">BPM</span>
              </div>
              <input
                type="range"
                min="40"
                max="240"
                value={bpm}
                onChange={(e) => onBpmChange(parseInt(e.target.value))}
                className="bpm-slider"
              />
            </div>
          </section>

          {/* Presets - Toggle Switch Style */}
          <section className="drawer-section rack-panel">
            <div className="rack-panel-header">
              <h3>PRESETS</h3>
              <span className="panel-led"></span>
            </div>
            <div className="preset-switch-grid">
              {presets.map(preset => (
                <label
                  key={preset.id}
                  className={`preset-switch ${activePresetId === preset.id ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="preset"
                    checked={activePresetId === preset.id}
                    onChange={() => onSelectPreset(preset.id)}
                  />
                  <span className="switch-track"></span>
                  <span className="preset-info">
                    <span className="preset-name">{preset.name}</span>
                    <span className="preset-meta">{preset.bpm} BPM</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Time Signature - Rotary Button Bank */}
          <section className="drawer-section rack-panel">
            <div className="rack-panel-header">
              <h3>TIME SIGNATURE</h3>
              <span className="panel-led"></span>
            </div>
            <div className="rotary-button-bank">
              {COMMON_TIME_SIGNATURES.map(ts => {
                const isActive = timeSignature.beatsPerMeasure === ts.beats && timeSignature.beatUnit === ts.unit;
                return (
                  <button
                    key={`${ts.beats}/${ts.unit}`}
                    className={`rotary-btn ${isActive ? 'active' : ''}`}
                    onClick={() => onTimeSignatureChange({
                      beatsPerMeasure: ts.beats,
                      beatUnit: ts.unit
                    })}
                  >
                    <span className="rotary-btn-indicator"></span>
                    <span className="rotary-btn-text">{ts.beats}/{ts.unit}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Sound Selector - Patch Bay Style */}
          <section className="drawer-section rack-panel">
            <div className="rack-panel-header">
              <h3>SOUND PATCH</h3>
              <span className="panel-led"></span>
            </div>
            <div className="patch-bay">
              {[
                // New musical sound families (highlighted)
                { value: 'chime', label: 'Chime', isNew: true },
                { value: 'orchestral', label: 'Orchestral', isNew: true },
                { value: 'woodyEnhanced', label: 'Woody+', isNew: true },
                { value: 'softMallet', label: 'Soft Mallet', isNew: true },
                // Existing wooden percussion (classic)
                { value: 'hollowWood', label: 'Hollow Wood' },
                { value: 'naturalClave', label: 'Natural Clave' },
                { value: 'softLog', label: 'Soft Log' },
                { value: 'mellowBongo', label: 'Mellow Bongo' },
                { value: 'gentleWoodBlock', label: 'Wood Block' },
                { value: 'warmWoodenClave', label: 'Warm Clave' },
                { value: 'softWoodenBlock', label: 'Soft Block' },
                { value: 'naturalWoodenLog', label: 'Wooden Log' },
                { value: 'gentleWoodenBongo', label: 'Wood Bongo' },
                { value: 'mellowWoodenChime', label: 'Wood Chime' }
              ].map(patch => (
                <button
                  key={patch.value}
                  className={`patch-btn ${soundType === patch.value ? 'active' : ''} ${patch.isNew ? 'new-sound' : ''}`}
                  onClick={() => {
                    onSoundTypeChange(patch.value);
                    // Reset params when switching to new sound family
                    if (patch.isNew) {
                      // Find the preset with this sound type and apply its params
                      const newPreset = presets.find(p => p.soundType === patch.value);
                      if (newPreset && newPreset.params) {
                        onSoundParamsChange(newPreset.params);
                      }
                    }
                  }}
                >
                  <span className="patch-indicator"></span>
                  {patch.label}
                </button>
              ))}
            </div>
          </section>

          {/* Fine Tune Section - Expandable */}
          <section className="drawer-section rack-panel">
            <div className="rack-panel-header">
              <h3>FINE TUNE</h3>
              <span className="panel-led"></span>
            </div>
            <button
              className="rotary-btn"
              style={{ width: '100%', marginBottom: isFineTuneOpen ? '1rem' : 0 }}
              onClick={() => setIsFineTuneOpen(!isFineTuneOpen)}
            >
              <span className="rotary-btn-indicator"></span>
              <span className="rotary-btn-text">
                {isFineTuneOpen ? 'CLOSE TUNING' : 'OPEN TUNING PANEL'}
              </span>
            </button>

            {isFineTuneOpen && (
              <div className="fine-tune-controls">
                {/* Attack Time */}
                <div className="fine-tune-control">
                  <label>Attack (Sharp ↔ Soft)</label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={soundParams.attackTime ?? 3}
                    onChange={(e) => onSoundParamsChange({ ...soundParams, attackTime: parseFloat(e.target.value) })}
                    className="bpm-slider"
                  />
                  <span className="fine-tune-value">{soundParams.attackTime ?? 3}ms</span>
                </div>

                {/* Decay Time */}
                <div className="fine-tune-control">
                  <label>Decay (Short ↔ Long)</label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={soundParams.decayTime ?? 150}
                    onChange={(e) => onSoundParamsChange({ ...soundParams, decayTime: parseFloat(e.target.value) })}
                    className="bpm-slider"
                  />
                  <span className="fine-tune-value">{soundParams.decayTime ?? 150}ms</span>
                </div>

                {/* Harmonic Content */}
                <div className="fine-tune-control">
                  <label>Harmonics (Pure ↔ Rich)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundParams.harmonicContent ?? 50}
                    onChange={(e) => onSoundParamsChange({ ...soundParams, harmonicContent: parseFloat(e.target.value) })}
                    className="bpm-slider"
                  />
                  <span className="fine-tune-value">{soundParams.harmonicContent ?? 50}%</span>
                </div>

                {/* Noise Level */}
                <div className="fine-tune-control">
                  <label>Noise (Clean ↔ Percussive)</label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={soundParams.noiseLevel ?? 0}
                    onChange={(e) => onSoundParamsChange({ ...soundParams, noiseLevel: parseFloat(e.target.value) })}
                    className="bpm-slider"
                  />
                  <span className="fine-tune-value">{soundParams.noiseLevel ?? 0}%</span>
                </div>

                {/* Brightness */}
                <div className="fine-tune-control">
                  <label>Brightness (Dark ↔ Bright)</label>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    value={soundParams.brightness ?? 2500}
                    onChange={(e) => onSoundParamsChange({ ...soundParams, brightness: parseFloat(e.target.value) })}
                    className="bpm-slider"
                  />
                  <span className="fine-tune-value">{soundParams.brightness ?? 2500}Hz</span>
                </div>

                {/* Reset Button */}
                <button
                  className="rotary-btn"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  onClick={() => {
                    // Find the active preset and reset to its default params
                    const activePreset = presets.find(p => p.id === activePresetId);
                    if (activePreset && activePreset.params) {
                      onSoundParamsChange(activePreset.params);
                    } else {
                      onSoundParamsChange({});
                    }
                  }}
                >
                  <span className="rotary-btn-indicator"></span>
                  <span className="rotary-btn-text">RESET TO PRESET</span>
                </button>
              </div>
            )}
          </section>

          {/* Volume - VU Meter Style */}
          <section className="drawer-section rack-panel">
            <div className="rack-panel-header">
              <h3>OUTPUT LEVEL</h3>
              <span className="panel-led"></span>
            </div>
            <div className="vu-meter-control">
              <div className="vu-meter">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`vu-segment ${i < vuLevel ? 'active' : ''} ${i >= 8 ? 'peak' : ''}`}
                  ></div>
                ))}
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="vu-slider"
              />
            </div>
          </section>

          {/* Tap Tempo - Record Button Style */}
          <section className="drawer-section rack-panel">
            <div className="rack-panel-header">
              <h3>TOOLS</h3>
              <span className="panel-led"></span>
            </div>
            <button
              className="rec-btn"
              onClick={onTapTempo}
            >
              <span className="rec-indicator"></span>
              <span className="rec-text">TAP</span>
            </button>
          </section>
        </div>
      </div>
    </>
  );
};

export default SettingsDrawer;