import React from 'react';

interface EvalBarProps {
  show: boolean;
  evalScore: number;
  evalDisplay: string;
  SLIDER_MIN: number;
  SLIDER_MAX: number;
  boardWidth: number;
}

export default function EvalBar({ show, evalScore, evalDisplay, SLIDER_MIN, SLIDER_MAX, boardWidth }: EvalBarProps) {
  // Normalize evalScore to 0-1 for bar fill (1 is white wins, 0 is black wins)
  const percent = Math.max(0, Math.min(1, (evalScore - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)));
  // Calculate the vertical position for the eval text: it should be at the top of the white bar
  const textTop = (1 - percent) * boardWidth;
  return (
    <div style={{
      position: 'relative',
      width: 48,
      height: boardWidth,
      minHeight: 240,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      pointerEvents: show ? 'auto' : 'none',
      opacity: show ? 1 : 0,
      transition: 'opacity 0.25s',
    }}>
      <div style={{
        position: 'absolute',
        left: 16,
        top: 0,
        width: 16,
        height: '100%',
        borderRadius: 12,
        background: '#181b22', // solid black background
        boxShadow: '0 2px 8px #0002',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}>
        <div style={{
          width: '100%',
          height: `${percent * 100}%`,
          background: '#fff', // solid white fill
          borderRadius: percent === 1 ? '12px 12px 0 0' : percent === 0 ? '0 0 12px 12px' : 12,
          transition: 'height 0.3s cubic-bezier(.77,0,.18,1)',
        }} />
      </div>
      <div style={{
        position: 'absolute',
        left: 0,
        top: textTop,
        transform: 'translateY(-50%)',
        width: 48,
        textAlign: 'center',
        color: '#fff',
        fontWeight: 900,
        fontSize: 18,
        letterSpacing: 0.2,
        textShadow: '0 2px 8px #23272f',
        userSelect: 'none',
        background: 'rgba(35,39,47,0.85)',
        borderRadius: 8,
        padding: '2px 0',
        boxShadow: '0 1px 4px #0002',
        pointerEvents: 'none',
        transition: 'top 0.3s cubic-bezier(.77,0,.18,1), opacity 0.25s',
        opacity: show ? 1 : 0,
      }}>{evalDisplay}</div>
    </div>
  );
}
