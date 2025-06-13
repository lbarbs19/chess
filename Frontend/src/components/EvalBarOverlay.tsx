import React from 'react';
import EvalBar from './EvalBar';

interface EvalBarOverlayProps {
  showEval: boolean;
  evalScore: number;
  evalDisplay: string;
  SLIDER_MIN: number;
  SLIDER_MAX: number;
  boardWidth: number;
  engineOn?: boolean; // Make engineOn optional
}

const EvalBarOverlay: React.FC<EvalBarOverlayProps> = ({
  showEval,
  evalScore,
  evalDisplay,
  SLIDER_MIN,
  SLIDER_MAX,
  boardWidth,
  engineOn,
}) => (
  <div style={{
    // Remove absolute positioning and top offset
    height: boardWidth,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 10,
    opacity: (engineOn ?? true) && showEval ? 1 : 0,
    transition: 'opacity 0.25s',
  }}>
    <EvalBar
      show={(engineOn ?? true) && showEval}
      evalScore={evalScore}
      evalDisplay={evalDisplay}
      SLIDER_MIN={SLIDER_MIN}
      SLIDER_MAX={SLIDER_MAX}
      boardWidth={boardWidth}
    />
  </div>
);

export default EvalBarOverlay;
