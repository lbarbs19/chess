import React from 'react';
import EngineControls from './EngineControls';
import MoveNav from './MoveNav';
import ComputerControls from './ComputerControls';

interface BoardControlsProps {
  engineOn: boolean;
  setEngineOn: (on: boolean) => void;
  showEval: boolean;
  setShowEval: (show: boolean) => void;
  showArrows: boolean;
  setShowArrows: (show: boolean) => void;
  maxDepth: number;
  setMaxDepth: (depth: number) => void;
  engineOutput?: string; // Make engineOutput optional
  moveIndex: number;
  moveHistory: string[];
  goToMove: (index: number) => void;
  computerMode: boolean;
  setComputerMode: (on: boolean) => void;
  computerDepth: number;
  setComputerDepth: (depth: number) => void;
}

const BoardControls: React.FC<BoardControlsProps> = ({
  engineOn,
  setEngineOn,
  showEval,
  setShowEval,
  showArrows,
  setShowArrows,
  maxDepth,
  setMaxDepth,
  engineOutput,
  moveIndex,
  moveHistory,
  goToMove,
  computerMode,
  setComputerMode,
  computerDepth,
  setComputerDepth,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'stretch', minWidth: 240, maxWidth: 260, width: 230, marginLeft: 24 }}>
    {/* Engine controls card */}
    <div style={{
      background: '#23272f',
      color: '#f3f3f3',
      borderRadius: 16,
      boxShadow: '0 2px 12px #0002',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      alignItems: 'stretch',
      marginBottom: 18
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: '#fff', letterSpacing: 0.5 }}>Engine Controls</div>
      <div style={{ fontFamily: 'monospace', fontSize: 16, whiteSpace: 'pre', minHeight: 40, maxHeight: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#22252b', borderRadius: 8, padding: 8, boxShadow: '0 1px 4px #0001', marginBottom: 8 }}>
        {engineOutput?.split('\n')[0] || 'Depth: ...'}
      </div>
      <EngineControls
        engineOn={engineOn}
        setEngineOn={setEngineOn}
        showEval={showEval}
        setShowEval={setShowEval}
        showArrows={showArrows}
        setShowArrows={setShowArrows}
        maxDepth={maxDepth}
        setMaxDepth={setMaxDepth}
      />

      <MoveNav moveIndex={moveIndex} moveHistory={moveHistory} goToMove={goToMove} />
    </div>
    {/* Computer controls box below, visually separate */}
    <ComputerControls
      computerMode={computerMode}
      setComputerMode={setComputerMode}
      computerDepth={computerDepth}
      setComputerDepth={setComputerDepth}
    />
  </div>
);

export default BoardControls;
