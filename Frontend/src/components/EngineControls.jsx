import React from 'react';
import ToggleSwitch from './ToggleSwitch';

export default function EngineControls({ engineOn, setEngineOn, showEval, setShowEval, showArrows, setShowArrows, maxDepth, setMaxDepth }) {
  const disabled = !engineOn;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <ToggleSwitch
        checked={engineOn}
        onChange={e => setEngineOn(e.target.checked)}
        label="Engine"
        disabled={false}
      />
      <ToggleSwitch
        checked={showEval}
        onChange={e => setShowEval(e.target.checked)}
        label="Show Eval Bar"
        disabled={disabled}
      />
      <ToggleSwitch
        checked={showArrows}
        onChange={e => setShowArrows(e.target.checked)}
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
