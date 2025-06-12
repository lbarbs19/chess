import React from 'react';

interface MoveNavProps {
  moveIndex: number;
  moveHistory: string[];
  goToMove: (index: number) => void;
}

export default function MoveNav({ moveIndex, moveHistory, goToMove }: MoveNavProps) {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
      <button onClick={() => goToMove(moveIndex - 1)} disabled={moveIndex === 0} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#23272f', color: '#fff', fontWeight: 600, fontSize: 16, cursor: moveIndex === 0 ? 'not-allowed' : 'pointer', opacity: moveIndex === 0 ? 0.5 : 1 }}>⟵ Prev</button>
      <span style={{ fontWeight: 600, fontSize: 16 }}>Move {moveIndex} / {moveHistory.length - 1}</span>
      <button onClick={() => goToMove(moveIndex + 1)} disabled={moveIndex === moveHistory.length - 1} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#23272f', color: '#fff', fontWeight: 600, fontSize: 16, cursor: moveIndex === moveHistory.length - 1 ? 'not-allowed' : 'pointer', opacity: moveIndex === moveHistory.length - 1 ? 0.5 : 1 }}>Next ⟶</button>
    </div>
  );
}
