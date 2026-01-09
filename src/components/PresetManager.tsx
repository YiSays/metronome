import React, { useState } from 'react'
import { Preset, PresetManager } from '../utils/presets'

interface PresetManagerProps {
  currentPreset: Preset | null
  onPresetSelect: (preset: Preset) => void
  onSavePreset: (preset: Preset) => void
  onDeletePreset: (id: string) => void
  onResetPresets: () => void
}

const PresetManagerComponent: React.FC<PresetManagerProps> = ({
  currentPreset,
  onPresetSelect,
  onSavePreset,
  onDeletePreset,
  onResetPresets
}) => {
  const [presets, setPresets] = useState<Preset[]>(PresetManager.getAllPresets())
  const [isSaving, setIsSaving] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showImportExport, setShowImportExport] = useState(false)
  const [importText, setImportText] = useState('')
  const [exportText, setExportText] = useState('')

  const handleSavePreset = () => {
    if (!saveName.trim()) return

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: saveName,
      bpm: 120,
      timeSignature: { beatsPerMeasure: 4, beatUnit: 4 },
      soundType: 'woodblock',
      volume: 0.5
    }

    onSavePreset(newPreset)
    setSaveName('')
    setIsSaving(false)
  }

  const handleExportPresets = () => {
    const exportData = PresetManager.exportPresets()
    setExportText(exportData)
    setShowImportExport(true)
  }

  const handleImportPresets = () => {
    try {
      PresetManager.importPresets(importText)
      setPresets(PresetManager.getAllPresets())
      setImportText('')
      setShowImportExport(false)
    } catch (error) {
      alert('Invalid preset data. Please check the format.')
    }
  }

  const handleResetPresets = () => {
    if (confirm('This will reset all presets to default. Continue?')) {
      onResetPresets()
      setPresets(PresetManager.getAllPresets())
    }
  }

  return (
    <div className="preset-manager">
      <div className="preset-header">
        <h3>Saved Presets</h3>
        <div className="preset-actions">
          <button
            onClick={() => setIsSaving(!isSaving)}
            className="save-btn"
          >
            {isSaving ? 'Cancel' : 'Save Current'}
          </button>
          <button onClick={handleExportPresets} className="export-btn">
            Export
          </button>
          <button onClick={() => setShowImportExport(!showImportExport)} className="import-btn">
            Import
          </button>
          <button onClick={handleResetPresets} className="reset-btn">
            Reset
          </button>
        </div>
      </div>

      {isSaving && (
        <div className="save-preset-form">
          <input
            type="text"
            placeholder="Enter preset name..."
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
          />
          <button onClick={handleSavePreset} disabled={!saveName.trim()}>
            Save
          </button>
        </div>
      )}

      {showImportExport && (
        <div className="import-export-panel">
          <div className="export-section">
            <h4>Export Presets</h4>
            <textarea
              value={exportText || PresetManager.exportPresets()}
              readOnly
              placeholder="Exported presets will appear here"
            />
            <button onClick={() => navigator.clipboard.writeText(exportText || PresetManager.exportPresets())}>
              Copy to Clipboard
            </button>
          </div>

          <div className="import-section">
            <h4>Import Presets</h4>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste exported preset data here"
            />
            <div className="import-actions">
              <button onClick={handleImportPresets} disabled={!importText.trim()}>
                Import
              </button>
              <button onClick={() => setImportText('')}>Clear</button>
            </div>
          </div>
        </div>
      )}

      <div className="preset-list">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className={`preset-item ${currentPreset?.id === preset.id ? 'active' : ''}`}
            onClick={() => onPresetSelect(preset)}
          >
            <div className="preset-info">
              <div className="preset-name">{preset.name}</div>
              <div className="preset-details">
                <span>{preset.bpm} BPM</span>
                <span>{preset.timeSignature.beatsPerMeasure}/{preset.timeSignature.beatUnit}</span>
                <span>{preset.soundType}</span>
              </div>
            </div>
            <div className="preset-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeletePreset(preset.id)
                  setPresets(PresetManager.getAllPresets())
                }}
                className="delete-btn"
                title="Delete preset"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PresetManagerComponent