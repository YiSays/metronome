# Pro Metronome 🎵

**English** | [中文](./README.zh-CN.md)

A high-precision, mobile-first web metronome built for professional musicians. It combines sample-accurate timing (Web Audio API) with a loud, punchy audio engine and a modern, gesture-friendly interface.

## ✨ Key Features

### 🎧 **Professional Audio Engine**
- **Loud & Punchy:** Custom audio pipeline with **Compression**, **Soft-Clipping Distortion**, and **Gain Staging** to cut through loud practice environments.
- **Synthesized Sounds:** No static sample files. All sounds are synthesized in real-time for zero latency and infinite variety.
  - **Woodblock:** Classic, organic "thock" sound.
  - **Click:** Sharp, high-frequency digital pulse.
  - **Bell:** Resonant mechanical bell (great for downbeats).
  - **Double Pulse:** Distinctive rhythmic marker.
  - **Amber:** A warm, filtered synth tone.
- **Sample-Accurate Timing:** Uses the Web Audio API clock for drift-free timing, independent of the main JavaScript thread.

### 📱 **Modern, Mobile-First UI**
- **Circular BPM Dial:** 
  - Drag the dial to change tempo smoothly.
  - **Visual Feedback:** The dial pulses on beats and flashes on downbeats.
  - **Split-Path Design:** Beautiful gradient fills that represent tempo progress.
- **Visual Beat Tracking:**
  - **Perfect Sync:** Visuals are synchronized to the audio subsystem using a custom queue-based lookahead system, ensuring the flash happens *exactly* when the sound plays.
- **Sidebar Settings:** Clean drawer interface for advanced settings, keeping the main stage clutter-free.

### 💾 **Smart Presets**
- **Dynamic Naming:** 
  - Presets automatically switch names to "Custom X" when you modify them.
  - They revert to their original names (e.g., "Slow Jam") if you restore the original settings.
- **Tap Tempo:** Tap your rhythm to instantly set the BPM.

## 🛠️ Technology Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** CSS Modules / Vanilla CSS variables
- **Audio:** Native Web Audio API (Oscillators, GainNodes, DynamicsCompressorNode, WaveShaperNode)
- **State Management:** React Hooks (`useMetronome`, `useRef` for audio timing)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- `npm` or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd metronome
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📐 Project Structure

```
src/
├── components/
│   ├── BpmDial.tsx           # Circular interactive dial
│   ├── VisualMetronome.tsx   # Audio-Visual Sync Engine
│   ├── SettingsDrawer.tsx    # Sidebar for presets/volume/etc.
│   └── TimeSignatureControl.tsx
├── hooks/
│   └── useMetronome.ts       # Core audio scheduling logic
├── utils/
│   ├── audioGenerator.ts     # Sound synthesis & audio graph setup
│   ├── constants.ts          # Shared configs (Time Signatures)
│   └── presets.ts            # Preset data & storage logic
├── App.tsx                   # Main layout & state orchestration
└── types/                    # TypeScript definitions
```

## 🧠 Architecture Highlights

### Audio-Visual Synchronization
To solve the common issue of visual lag in JS metronomes, this project uses a decoupled architecture:
1. **Audio Thread:** Schedules audio events ahead of time (lookahead) using `AudioContext.currentTime`.
2. **Visual Thread:** Uses `requestAnimationFrame` to poll a queue of scheduled beats.
3. **Sync:** The visual component checks the queue against the *actual* audio time to trigger animations precisely when the sound hits the speaker, correcting for any main-thread latency.

### "Loudness" Engineering
Standard Web Audio oscillators can be quiet. We implement a mastering chain:
`Oscillators -> Pre-Gain -> WaveShaper (Saturation) -> Compressor (Limiting) -> Master Gain`
This allows the metronome to be perceived as significantly louder without digital clipping.

## 📄 License

MIT License.