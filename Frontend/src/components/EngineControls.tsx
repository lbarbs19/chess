import React from 'react';
import ToggleSwitch from './ToggleSwitch';

interface EngineControlsProps {
  engineOn: boolean;
  setEngineOn: (on: boolean) => void;
  showEval: boolean;
  setShowEval: (on: boolean) => void;
  showArrows: boolean;
  setShowArrows: (on: boolean) => void;
  maxDepth: number;
  setMaxDepth: (depth: number) => void;
}

export default function EngineControls({ engineOn, setEngineOn, showEval, setShowEval, showArrows, setShowArrows, maxDepth, setMaxDepth }: EngineControlsProps) {
  // Fix event types for onChange
  // Example: onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEngineOn(e.target.checked)}

  const disabled = !engineOn;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <ToggleSwitch
        checked={engineOn}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEngineOn(e.target.checked)}
        label="Engine"
        disabled={false}
      />
      <ToggleSwitch
        checked={showEval}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowEval(e.target.checked)}
        label="Show Eval Bar"
        disabled={disabled}
      />
      <ToggleSwitch
        checked={showArrows}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowArrows(e.target.checked)}
        label="Show Best Move"
        disabled={disabled}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, opacity: disabled ? 0.5 : 1 }}>
        <span>Depth:</span>
        <input
          type="range"
          min={1}
          max={30}
          value={maxDepth}
          onChange={e => setMaxDepth(Number(e.target.value))}
          style={{ width: 100 }}
          disabled={disabled}
        />
        <span>{maxDepth}</span>
      </div>
    </div>
  );
}
