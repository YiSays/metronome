import React from 'react';
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
  const currentIndex = COMMON_TIME_SIGNATURES.findIndex(
    ts => ts.beats === timeSignature.beatsPerMeasure && ts.unit === timeSignature.beatUnit
  );

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % COMMON_TIME_SIGNATURES.length;
    const nextTs = COMMON_TIME_SIGNATURES[nextIndex];
    onChange({ beatsPerMeasure: nextTs.beats, beatUnit: nextTs.unit });
  };

  const handlePrev = () => {
    const prevIndex = currentIndex - 1 < 0 ? COMMON_TIME_SIGNATURES.length - 1 : currentIndex - 1;
    const prevTs = COMMON_TIME_SIGNATURES[prevIndex];
    onChange({ beatsPerMeasure: prevTs.beats, beatUnit: prevTs.unit });
  };

  return (
    <div className="ts-control">
       <button className="ts-arrow-btn" onClick={handlePrev} aria-label="Previous Time Signature">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
           <path d="M15 18l-6-6 6-6" />
         </svg>
       </button>
       
       <div className="ts-display">
         <span className="ts-beats">{timeSignature.beatsPerMeasure}</span>
         <span className="ts-divider">/</span>
         <span className="ts-unit">{timeSignature.beatUnit}</span>
       </div>

       <button className="ts-arrow-btn" onClick={handleNext} aria-label="Next Time Signature">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
           <path d="M9 18l6-6-6-6" />
         </svg>
       </button>
    </div>
  );
};

export default TimeSignatureControl;