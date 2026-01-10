# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Metronome is a professional web-based metronome built with modern web technologies. It provides musicians with sample-accurate timing using Web Audio API, eliminating the need for server-side audio processing and sound card dependencies. The application features a responsive UI with visual metronome animation, comprehensive preset management, and tap tempo functionality.

**Technology Stack:**
- **React 18** with TypeScript for robust UI development
- **Vite** for fast development and build performance
- **Web Audio API** for precise audio generation and timing
- **CSS-in-JS** with comprehensive animations and responsive design

## Key Commands

### Installation & Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Commands
```bash
# Run tests (if added in future)
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Code Architecture

### Core Files
- **`src/App.tsx`** - Main application component with navigation and state management
- **`src/hooks/useMetronome.ts`** - Core metronome logic and Web Audio API integration
- **`src/utils/audioGenerator.ts`** - Audio synthesis and sound generation
- **`src/components/VisualMetronome.tsx`** - Animated visual metronome
- **`src/components/MetronomeControls.tsx`** - Main control interface
- **`src/utils/presets.ts`** - Preset management system

### Audio Generation (audioGenerator.ts)
- **Core Algorithm:** Generates precise sine waves, square waves, and complex layered sounds
- **Time Signatures:** Supports 4/4, 3/4, 6/8, 2/4, 5/4, 7/4
- **Sample Rate:** 44.1 kHz, 16-bit PCM format
- **Sound Types:** Pure tone (880Hz/440Hz), click, bell, and custom layered sounds
- **Timing:** Sample-accurate scheduling with lookahead buffer

### Web Audio API Integration
- **AudioContext:** Handles audio processing and scheduling
- **OscillatorNode:** Generates pure tones and complex waveforms
- **GainNode:** Controls volume and creates attack/decay envelopes
- **BiquadFilter:** Shapes sound characteristics (for bell sounds)
- **DynamicsCompressor:** Adds punch and consistency

### Visual Components
- **Animated Pendulum:** Visual timing reference synchronized with audio
- **Beat Indicators:** Color-coded lights for downbeats and regular beats
- **Responsive Design:** Works on desktop and mobile devices

## Development Guidelines

### Audio Generation
- Use `AudioGenerator.createSound()` for individual sounds
- Use `AudioGenerator.scheduleSound()` for precise timing
- Maintain 44.1kHz sample rate for high-quality audio
- Implement proper gain automation for attack/decay envelopes
- Use lookahead scheduling to prevent timing drift

### Web Audio API Best Practices
- Initialize AudioContext on user interaction (click to start)
- Resume suspended contexts before scheduling new audio
- Clean up audio nodes to prevent memory leaks
- Use exponentialRampToValueAtTime for smooth volume transitions
- Implement proper error handling for audio context failures

### React Component Development
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Handle audio context lifecycle in useEffect hooks
- Use memoization for expensive calculations
- Maintain accessibility standards (aria-labels, keyboard navigation)

### Adding Features
- **New Sound Types:** Extend `createSound()` method in audioGenerator.ts
- **New Time Signatures:** Update time signature options in MetronomeControls
- **New Visual Effects:** Enhance animations in VisualMetronome.tsx
- **New Preset Types:** Modify preset structure in presets.ts
- **New UI Controls:** Add to MetronomeControls and update state management

### Testing
- Test audio generation across full BPM range (40-240)
- Verify time signature calculations for all supported meters
- Test preset save/load functionality
- Check audio playback on different browsers and devices
- Test timing accuracy with external metronome or reference audio

## Common Tasks

### Adding a New Sound Type
1. Add new case to `createSound()` method in audioGenerator.ts
2. Update SoundType type definition in types/index.ts
3. Add option to sound type selector in MetronomeControls.tsx
4. Test audio quality and timing accuracy

### Adding a New Time Signature
1. Add new option to timeSignatureOptions array in MetronomeControls.tsx
2. Test audio generation for the new signature
3. Consider adding visual indicators for complex meters

### Customizing Audio
1. Modify frequencies in createSound() methods
2. Adjust beep duration and silence timing
3. Add new oscillator types or filter configurations
4. Implement ADSR envelope shaping

### Performance Optimization
1. Use memoization for expensive calculations in hooks
2. Implement proper cleanup in useEffect hooks
3. Optimize CSS animations for smooth rendering
4. Consider audio buffer pre-generation for common patterns

## Troubleshooting

### Audio Issues
- **No sound:** Check AudioContext initialization and user interaction
- **Timing drift:** Verify lookahead buffer and scheduling precision
- **Browser compatibility:** Test Web Audio API support in target browsers
- **Mobile audio:** Ensure proper user interaction to unlock audio

### Timing Issues
- **Inaccurate timing:** Check Web Audio API scheduling implementation
- **Drift over time:** Verify use of audioContext.currentTime for calculations
- **Jitter:** Implement proper lookahead buffer and buffer rotation

### Performance Issues
- **High CPU usage:** Optimize animations and reduce re-renders
- **Memory leaks:** Properly clean up audio nodes and event listeners
- **Slow startup:** Consider lazy loading of non-critical components

## Files to Know

**Critical Files:**
- `/src/App.tsx` - Main application component
- `/src/hooks/useMetronome.ts` - Core metronome logic
- `/src/utils/audioGenerator.ts` - Audio synthesis engine
- `/src/components/VisualMetronome.tsx` - Visual timing component
- `/src/utils/presets.ts` - Preset management

**Configuration:**
- `/package.json` - Project dependencies and scripts
- `/vite.config.ts` - Vite configuration
- `/tsconfig.json` - TypeScript configuration
- `/index.html` - HTML entry point

## Performance Considerations

- **Audio Scheduling:** Use Web Audio API's precise timing capabilities
- **Lookahead Buffer:** Prevent timing drift with proper buffer management
- **Memory Management:** Clean up audio nodes and prevent leaks
- **Animation Optimization:** Use CSS transforms and opacity for smooth animations
- **Responsive Design:** Optimize for both desktop and mobile performance

## Browser Compatibility

- **Web Audio API:** Chrome 14+, Firefox 25+, Safari 6+, Edge 12+
- **Modern JavaScript:** ES2020+ features required
- **Mobile Support:** iOS Safari, Android Chrome
- **Audio:** Requires user interaction to start audio context

## Deployment

### Static Hosting
- Zero server dependencies - works on any static web host
- No database or backend required
- Can be deployed to Netlify, Vercel, GitHub Pages
- Works offline after initial load

### Build Process
- Use `npm run build` for production build
- Output is in `dist/` directory
- Minified and optimized for performance

## Key Differences from Original Python Version

1. **No Server Dependencies:** Runs entirely in browser
2. **Sample-Accurate Timing:** Web Audio API provides microsecond precision
3. **Better Performance:** No server-side audio processing delays
4. **Mobile Friendly:** Works on smartphones and tablets
5. **Offline Capable:** No internet connection required after loading
6. **Modern UI:** Responsive design with professional animations
7. **Enhanced Features:** Tap tempo, preset management, visual metronome