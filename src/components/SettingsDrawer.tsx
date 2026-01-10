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
  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="drawer-content">
          <section className="drawer-section">
             <h3>Tempo (BPM)</h3>
             <div className="drawer-bpm-control">
                <span className="drawer-bpm-value">{bpm}</span>
                <input 
                  type="range" 
                  min="40" 
                  max="240" 
                  value={bpm}
                  onChange={(e) => onBpmChange(parseInt(e.target.value))}
                  className="volume-slider-drawer"
                />
             </div>
          </section>

          <section className="drawer-section">
            <h3>Presets</h3>
            <div className="drawer-presets-grid">
              {presets.map(preset => (
                <button
                  key={preset.id}
                  className={`drawer-preset-btn ${activePresetId === preset.id ? 'active' : ''}`}
                  onClick={() => onSelectPreset(preset.id)}
                >
                  <span className="preset-name">{preset.name}</span>
                  <span className="preset-meta">{preset.bpm} BPM</span>
                </button>
              ))}
            </div>
          </section>

          <section className="drawer-section">
            <h3>Time Signature</h3>
            <div className="ts-selector">
              {COMMON_TIME_SIGNATURES.map(ts => (
                <button
                  key={`${ts.beats}/${ts.unit}`}
                  className={`ts-btn ${
                    timeSignature.beatsPerMeasure === ts.beats && 
                    timeSignature.beatUnit === ts.unit ? 'active' : ''
                  }`}
                  onClick={() => onTimeSignatureChange({ 
                    beatsPerMeasure: ts.beats, 
                    beatUnit: ts.unit 
                  })}
                >
                  {ts.beats}/{ts.unit}
                </button>
              ))}
            </div>
          </section>

          <section className="drawer-section">
            <h3>Sound</h3>
            <select 
              value={soundType} 
              onChange={(e) => onSoundTypeChange(e.target.value)}
              className="drawer-select"
            >
              <option value="woodblock">Woodblock</option>
              <option value="click">Digital Click</option>
              <option value="doublePulse">Double Pulse</option>
              <option value="bell">Mechanical Bell</option>
              <option value="amber">Amber</option>
            </select>
          </section>

          <section className="drawer-section">
            <h3>Volume</h3>
            <div className="volume-control-drawer">
              <span className="vol-icon">🔈</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="volume-slider-drawer"
              />
              <span className="vol-icon">🔊</span>
            </div>
          </section>
          
           <section className="drawer-section">
            <h3>Tools</h3>
             <button className="drawer-action-btn" onClick={onTapTempo}>
               Tap Tempo
             </button>
          </section>
        </div>
      </div>
    </>
  );
};

export default SettingsDrawer;