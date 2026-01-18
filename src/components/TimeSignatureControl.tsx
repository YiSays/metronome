import React, { useState, useEffect } from 'react';
import { COMMON_TIME_SIGNATURES } from '../utils/constants';
import './TimeSignatureControl.css';

interface TimeSignatureControlProps {
  timeSignature: { beatsPerMeasure: number; beatUnit: number };
  onChange: (ts: { beatsPerMeasure: number; beatUnit: number }) => void;
}

const TimeSignatureControl: React.FC<TimeSignatureControlProps> = ({
  timeSignature,
  onChange
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastDirection, setLastDirection] = useState<'prev' | 'next' | null>(null);

  const currentIndex = COMMON_TIME_SIGNATURES.findIndex(
    ts => ts.beats === timeSignature.beatsPerMeasure && ts.unit === timeSignature.beatUnit
  );

  const handleNext = () => {
    setLastDirection('next');
    setIsAnimating(true);
    const nextIndex = (currentIndex + 1) % COMMON_TIME_SIGNATURES.length;
    const nextTs = COMMON_TIME_SIGNATURES[nextIndex];
    onChange({ beatsPerMeasure: nextTs.beats, beatUnit: nextTs.unit });
  };

  const handlePrev = () => {
    setLastDirection('prev');
    setIsAnimating(true);
    const prevIndex = currentIndex - 1 < 0 ? COMMON_TIME_SIGNATURES.length - 1 : currentIndex - 1;
    const prevTs = COMMON_TIME_SIGNATURES[prevIndex];
    onChange({ beatsPerMeasure: prevTs.beats, beatUnit: prevTs.unit });
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <div className="ts-control">
       <button
         className={`ts-arrow-btn ${lastDirection === 'prev' && isAnimating ? 'clicking' : ''}`}
         onClick={handlePrev}
         aria-label="Previous Time Signature"
       >
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
           <path d="M15 18l-6-6 6-6" />
         </svg>
       </button>

       <div className="ts-display-container">
         <div className="ts-display">
           <span className="ts-beats">{timeSignature.beatsPerMeasure}</span>
           <span className="ts-divider">/</span>
           <span className="ts-unit">{timeSignature.beatUnit}</span>
         </div>
       </div>

       <button
         className={`ts-arrow-btn ${lastDirection === 'next' && isAnimating ? 'clicking' : ''}`}
         onClick={handleNext}
         aria-label="Next Time Signature"
       >
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
           <path d="M9 18l6-6-6-6" />
         </svg>
       </button>
    </div>
  );
};

export default TimeSignatureControl;