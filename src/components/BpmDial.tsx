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
  const dialRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);

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
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    centerRef.current = null;
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
  const [isPulsing, setIsPulsing] = useState(false);
  const lastBeatRef = useRef(-1);

  useEffect(() => {
    if (!isPlaying) {
        setIsFlashing(false);
        setIsPulsing(false);
        lastBeatRef.current = -1;
        return;
    }

    // Trigger effects only when beat changes
    if (currentBeat !== lastBeatRef.current) {
        // Pulse on every beat
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 100);

        // Flash text only on downbeat
        if (currentBeat === 0) {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 100);
        }
        
        lastBeatRef.current = currentBeat;
    }
  }, [currentBeat, isPlaying]);

  return (
    <div className="bpm-dial-container">
      <div 
        className="bpm-dial"
        ref={dialRef}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      >
        <svg width="300" height="300" viewBox="0 0 300 300" className={`dial-svg ${isPulsing ? 'pulse-beat' : ''}`}>
          <defs>
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Track (Remaining part) */}
          <path 
            d={trackPath} 
            fill="none" 
            stroke="url(#trackGradient)" 
            strokeWidth="20" 
            strokeLinecap="round"
          />

          {/* Progress (Filled part) */}
          <path 
            d={progressPath} 
            fill="none" 
            stroke="url(#progressGradient)" 
            strokeWidth="20" 
            strokeLinecap="round"
          />

          <circle 
            cx={currentCoord.x} 
            cy={currentCoord.y} 
            r="16" 
            fill="#fff"
            filter="url(#glow)"
            style={{ cursor: 'grab' }}
          />
        </svg>

        <div className="dial-center-content">
          <div className="dial-bpm-label">BPM</div>
          <div className={`dial-bpm-value ${isFlashing ? 'flash-text' : ''}`}>{bpm}</div>
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
