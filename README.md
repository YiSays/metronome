# Professional Metronome

A precise, web-based metronome designed for musicians and bands with sample-accurate timing using Web Audio API.

## Features

### 🎵 **Core Functionality**
- **Sample-accurate timing** using Web Audio API for professional precision
- **BPM range**: 40-240 BPM with fine-grained control
- **Time signatures**: 4/4, 3/4, 6/8, 2/4, 5/4, 7/4 and more
- **Multiple sound types**: Pure tone, click, bell, and custom layered sounds

### 🎛️ **Advanced Controls**
- **Real-time BPM adjustment** with visual feedback
- **Volume control** for different playing environments
- **Tap tempo** functionality for instant tempo detection
- **Visual metronome** with animated pendulum and beat indicators

### 💾 **Preset Management**
- **Save/load presets** with custom names
- **Export/import** presets for sharing
- **Default presets** for common tempos and styles
- **Reset to defaults** option

### 🎨 **Visual Experience**
- **Animated pendulum** that swings in time with the beat
- **Beat indicators** with different colors for downbeats and regular beats
- **Responsive design** that works on desktop and mobile
- **Dark theme** optimized for stage use

## Technology Stack

- **React 18** with TypeScript for robust UI development
- **Vite** for fast development and build performance
- **Web Audio API** for precise audio generation and timing
- **CSS-in-JS** with comprehensive animations and responsive design

## Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- Modern web browser with Web Audio API support

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

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage Guide

### Basic Operation
1. **Initialize Audio**: Click "Initialize Audio" to enable Web Audio API
2. **Set BPM**: Use the slider or input to set your desired tempo
3. **Select Time Signature**: Choose from common time signatures
4. **Choose Sound Type**: Select your preferred metronome sound
5. **Start Playing**: Click "Play" to begin the metronome

### Advanced Features

#### Tap Tempo
- Enable Tap Tempo mode
- Tap the button in time with your desired tempo
- The metronome automatically calculates and applies the BPM
- Use 4-8 taps for best accuracy

#### Presets
- **Save Current**: Save your current settings with a custom name
- **Load Preset**: Click any preset to apply its settings
- **Export/Import**: Share presets with other users
- **Reset**: Restore default presets

#### Visual Metronome
- Watch the animated pendulum for visual timing reference
- Downbeats are highlighted with blue color and larger size
- Beat numbers show current position in the measure

## Browser Compatibility

This metronome works in all modern browsers that support:
- **Web Audio API** (Chrome 14+, Firefox 25+, Safari 6+, Edge 12+)
- **Modern JavaScript** (ES2020+ features)

**Note**: Audio context requires user interaction to start (click to begin).

## Performance & Accuracy

### Timing Precision
- **Microsecond precision** using Web Audio API's scheduling
- **Lookahead buffer** prevents timing drift
- **Sample-accurate** audio generation
- **No timing dependencies** on UI refresh rates

### Audio Quality
- **44.1kHz sample rate** for high-quality audio
- **16-bit PCM** format for compatibility
- **Multiple sound algorithms** for different preferences
- **Volume normalization** to prevent clipping

## Development

### Project Structure
```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main application component
└── App.css             # Global styles
```

### Key Files
- `hooks/useMetronome.ts` - Core metronome logic and Web Audio API integration
- `utils/audioGenerator.ts` - Audio synthesis and sound generation
- `components/VisualMetronome.tsx` - Animated visual metronome
- `components/MetronomeControls.tsx` - Main control interface
- `utils/presets.ts` - Preset management system

### Adding New Features
1. **New Sound Types**: Extend `createSound()` in `audioGenerator.ts`
2. **New Time Signatures**: Update time signature options in components
3. **New Visual Effects**: Enhance animations in `VisualMetronome.tsx`
4. **New Preset Types**: Modify preset structure in `presets.ts`

## Deployment

### Static Hosting
This metronome can be deployed to any static web host:
- **Netlify**
- **Vercel**
- **GitHub Pages**
- **Any web server**

Simply build the project with `npm run build` and upload the `dist/` folder.

### No Server Dependencies
- **Zero server-side requirements**
- **Works offline** after initial load
- **No database needed**
- **No API calls required**

## Troubleshooting

### Audio Not Playing
- Ensure you've clicked "Initialize Audio"
- Check browser audio permissions
- Verify no other audio contexts are suspended
- Try refreshing the page

### Timing Issues
- Ensure your browser is up to date
- Close other audio-intensive applications
- Check for browser extensions that might interfere with audio

### Mobile Usage
- Works on iOS and Android
- Requires user interaction to start audio
- May need to unlock audio on first interaction

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with clear description

## License

MIT License - see LICENSE file for details.

## Support

For issues, questions, or feature requests:
- Create an issue in the repository
- Include browser version and steps to reproduce
- Describe expected vs. actual behavior

---

**Built for musicians who demand precision and reliability.**
 
