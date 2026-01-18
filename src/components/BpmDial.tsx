import React, { useState, useEffect, useRef } from 'react';
import './BpmDial.css';

interface BpmDialProps {
  bpm: number;
  min: number;
  max: number;
  onChange: (bpm: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentBeat?: number; // 0-based index of current beat
}

const BpmDial: React.FC<BpmDialProps> = ({ bpm, min, max, onChange, isPlaying, onTogglePlay, currentBeat = 0 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0); // For haptic-style visual feedback
  const dialRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);
  const lastRotationRef = useRef(0);
  const rotationTimeoutRef = useRef<number>();

  // Calculate angle from BPM
  // Map min-max BPM to -135deg to +135deg (270 degrees total range)
  const angleRange = 270;
  const startAngle = -135;

  const bpmToAngle = (value: number) => {
    const percent = (value - min) / (max - min);
    return startAngle + (percent * angleRange);
  };

  const angleToBpm = (angle: number) => {
    let normalizedAngle = angle;
    if (normalizedAngle > 180) normalizedAngle -= 360;

    if (normalizedAngle < -135) normalizedAngle = -135;
    if (normalizedAngle > 135) normalizedAngle = 135;

    const percent = (normalizedAngle - startAngle) / angleRange;
    return Math.round(min + (percent * (max - min)));
  };

  const handleStart = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    setIsDragging(true);
    setRotation(1); // Slight rotation for tactile feedback
    handleMove(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!centerRef.current) return;

    const dx = clientX - centerRef.current.x;
    const dy = clientY - centerRef.current.y;

    let angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * (180 / Math.PI);

    angleDeg += 90;

    if (angleDeg > 180) angleDeg -= 360;

    const newBpm = angleToBpm(angleDeg);
    if (newBpm !== bpm) {
      onChange(newBpm);

      // Calculate rotation direction for visual feedback
      const newAngle = bpmToAngle(newBpm);
      const angleDelta = newAngle - lastRotationRef.current;

      // Create rotation feedback (subtle jerk on change)
      if (Math.abs(angleDelta) > 2) {
        setRotation(angleDelta > 0 ? 3 : -3);
        if (rotationTimeoutRef.current) window.clearTimeout(rotationTimeoutRef.current);
        rotationTimeoutRef.current = window.setTimeout(() => setRotation(0), 80);
        lastRotationRef.current = newAngle;
      }
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    centerRef.current = null;
    setRotation(0);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      if (isDragging) handleEnd();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => {
      if (isDragging) handleEnd();
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging]);

  const currentAngle = bpmToAngle(bpm);
  lastRotationRef.current = currentAngle;

  const r = 120;
  const cx = 150;
  const cy = 150;

  const getCoord = (angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: cx + (r * Math.cos(angleInRadians)),
      y: cy + (r * Math.sin(angleInRadians))
    };
  };

  const startCoord = getCoord(-135);
  const endCoord = getCoord(135);
  const currentCoord = getCoord(currentAngle);

  const trackAngleDiff = 135 - currentAngle;
  const trackLargeArcFlag = trackAngleDiff > 180 ? 1 : 0;
  const trackPath = `M ${currentCoord.x} ${currentCoord.y} A ${r} ${r} 0 ${trackLargeArcFlag} 1 ${endCoord.x} ${endCoord.y}`;

  const progressAngleDiff = currentAngle - (-135);
  const progressLargeArcFlag = progressAngleDiff > 180 ? 1 : 0;
  const progressPath = `M ${startCoord.x} ${startCoord.y} A ${r} ${r} 0 ${progressLargeArcFlag} 1 ${currentCoord.x} ${currentCoord.y}`;

  // Visual effects state
  const [isFlashing, setIsFlashing] = useState(false);
  const [isDownbeat, setIsDownbeat] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [ledGlow, setLedGlow] = useState(false);
  const lastBeatRef = useRef(-1);

  useEffect(() => {
    if (!isPlaying) {
        setIsFlashing(false);
        setIsPulsing(false);
        setIsDownbeat(false);
        setLedGlow(false);
        lastBeatRef.current = -1;
        return;
    }

    // Trigger effects only when beat changes
    if (currentBeat !== lastBeatRef.current) {
        // Pulse on every beat
        setIsPulsing(true);
        setIsLedGlow(true);
        setTimeout(() => {
          setIsPulsing(false);
          setLedGlow(false);
        }, 80);

        // Flash amber on downbeat
        if (currentBeat === 0) {
            setIsFlashing(true);
            setIsDownbeat(true);
            setTimeout(() => {
              setIsFlashing(false);
              setIsDownbeat(false);
            }, 100);
        }

        lastBeatRef.current = currentBeat;
    }
  }, [currentBeat, isPlaying]);

  const setIsLedGlow = (glow: boolean) => {
    setLedGlow(glow);
  };

  return (
    <div className="bpm-dial-container">
      <div
        className={`bpm-dial ${isDragging ? 'dragging' : ''}`}
        ref={dialRef}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        style={{ transform: `scale(${1 - rotation * 0.002})` }}
      >
        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          className={`dial-svg ${isPulsing ? 'pulse-beat' : ''}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <defs>
            {/* Track gradient - metallic steel */}
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a2a38" />
              <stop offset="50%" stopColor="#1a1a24" />
              <stop offset="100%" stopColor="#2a2a38" />
            </linearGradient>

            {/* Progress gradient - copper to amber for analog warmth */}
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b87333" />
              <stop offset="50%" stopColor="#ffb86c" />
              <stop offset="100%" stopColor="#ffd4a3" />
            </linearGradient>

            {/* Downbeat glow gradient */}
            <linearGradient id="downbeatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b35" />
              <stop offset="100%" stopColor="#ffb86c" />
            </linearGradient>

            {/* Glow filter for LED effect */}
            <filter id="ledGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Phosphor persistence filter for CRT effect */}
            <filter id="phosphorTrail">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Track background - recessed channel */}
          <path
            d={trackPath}
            fill="none"
            stroke="url(#trackGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Track inner shadow for depth */}
          <path
            d={trackPath}
            fill="none"
            stroke="#000"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Progress (Filled part) - Analog copper/amber tone */}
          <path
            d={progressPath}
            fill="none"
            stroke={isDownbeat ? 'url(#downbeatGradient)' : 'url(#progressGradient)'}
            strokeWidth="16"
            strokeLinecap="round"
            filter="url(#ledGlow)"
            style={{
              filter: isDownbeat ? 'drop-shadow(0 0 8px rgba(255, 184, 108, 0.8)) drop-shadow(0 0 16px rgba(255, 184, 108, 0.4))' : 'drop-shadow(0 0 4px rgba(184, 115, 51, 0.4))'
            }}
          />

          {/* Knurled grip ring (background layer) */}
          <circle
            cx={cx}
            cy={cy}
            r="95"
            fill="none"
            stroke="#2a2a38"
            strokeWidth="2"
            strokeDasharray="2 4"
            opacity="0.5"
          />

          {/* Dial pointer/knob with chrome finish */}
          <circle
            cx={currentCoord.x}
            cy={currentCoord.y}
            r="18"
            fill="url(#trackGradient)"
            stroke="#666"
            strokeWidth="1"
            style={{
              filter: isPulsing ? 'drop-shadow(0 0 6px rgba(255, 184, 108, 0.6))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
              cursor: 'grab'
            }}
          />

          {/* Pointer indicator on knob */}
          <circle
            cx={currentCoord.x}
            cy={currentCoord.y}
            r="6"
            fill={isDownbeat ? '#ffb86c' : '#444'}
            style={{
              filter: isDownbeat ? 'drop-shadow(0 0 4px rgba(255, 184, 108, 0.9))' : 'none'
            }}
          />
        </svg>

        <div className="dial-center-content">
          <div className="dial-bpm-label">BPM</div>
          <div className={`dial-bpm-value ${isFlashing ? 'flash-text' : ''} ${ledGlow ? 'led-glow' : ''}`}>{bpm}</div>
          <button
            className={`dial-play-btn ${isPlaying ? 'playing' : ''}`}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
          >
            {isPlaying ? (
               <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                 <rect x="6" y="4" width="4" height="16" rx="1" />
                 <rect x="14" y="4" width="4" height="16" rx="1" />
               </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BpmDial;
