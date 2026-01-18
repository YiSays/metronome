import React from 'react';
import { Preset } from '../utils/presets';
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
  onTapTempo
}) => {
  // Calculate VU meter level based on volume
  const vuLevel = Math.round(volume * 10);

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
                  className={`patch-btn ${soundType === patch.value ? 'active' : ''}`}
                  onClick={() => onSoundTypeChange(patch.value)}
                >
                  <span className="patch-indicator"></span>
                  {patch.label}
                </button>
              ))}
            </div>
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