import React from 'react';
import ToggleSwitch from './ToggleSwitch';

interface ComputerControlsProps {
  computerMode: boolean;
  setComputerMode: (on: boolean) => void;
  computerDepth: number;
  setComputerDepth: (depth: number) => void;
}

export default function ComputerControls({ computerMode, setComputerMode, computerDepth, setComputerDepth }: ComputerControlsProps) {
  return (
    <div style={{
      width: 240,
      background: '#23272f',
      color: '#f3f3f3',
      borderRadius: 16,
      boxShadow: '0 2px 12px #0002',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      alignItems: 'stretch',
      marginRight: 0,
      marginLeft: 0,
      fontWeight: 600,
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: '#fff', letterSpacing: 0.5, textAlign: 'center' }}>Play Against CPU</div>
      <ToggleSwitch
        checked={computerMode}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComputerMode(e.target.checked)}
        label="Enable Computer"
        disabled={false}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: computerMode ? 1 : 0.5 }}>
        <span>Depth:</span>
        <input
          type="range"
          min={1}
          max={30}
          value={computerDepth}
          onChange={e => setComputerDepth(Number(e.target.value))}
          style={{ width: 80 }}
          disabled={!computerMode}
        />
        <span>{computerDepth}</span>
      </div>
      <div style={{ fontSize: 13, color: '#b0b8c1', marginTop: 8, lineHeight: 1.3, textAlign: 'center' }}>
        When enabled, the computer will play as Black using its own engine and depth.
      </div>
    </div>
  );
}
