import React from 'react';
import { Chessboard } from 'react-chessboard';

interface ChessBoardWrapperProps {
  boardWidth: number;
  fen: string;
  arrow: any;
  onMove: (
    sourceSquare: string,
    targetSquare: string
  ) => {
    move: any;
    isCapture?: boolean;
    isCheck?: boolean;
    isCastle?: boolean;
  } | false;
  playMoveSound?: (args: { isCheck?: boolean; isCapture?: boolean; isCastle?: boolean }) => void;
}

export default function ChessBoardWrapper({ boardWidth, fen, arrow, onMove, playMoveSound }: ChessBoardWrapperProps) {
  // Handle piece drop and sound, then notify parent
  function handleDrop(sourceSquare: string, targetSquare: string) {
    // Parent must provide a function that returns { move, isCapture, isCheck, isCastle } or false
    const result = onMove(sourceSquare, targetSquare);
    if (result && typeof result === 'object') {
      // Only play sound if playMoveSound is provided (for user moves, App.tsx will handle it)
      if (playMoveSound) {
        playMoveSound({
          isCheck: !!result.isCheck,
          isCapture: !!result.isCapture,
          isCastle: !!result.isCastle,
        });
      }
      return !!result.move;
    }
    return false;
  }

  return (
    <div style={{
      width: boardWidth,
      height: boardWidth,
      aspectRatio: '1 / 1',
      maxWidth: 900,
      maxHeight: 900,
      minWidth: 240,
      minHeight: 240,
      transition: 'width 0.2s, height 0.2s',
      boxShadow: '0 4px 24px #0004',
      borderRadius: 10,
      overflow: 'hidden',
      background: '#23272f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 24, // Add space between board and controls
    }}>
      <Chessboard
        id="board1"
        boardWidth={boardWidth}
        position={fen}
        onPieceDrop={handleDrop}
        customArrows={arrow}
        // @ts-ignore: boardStyle is not a valid prop for react-chessboard, but kept for legacy style. Remove if not needed.
        boardStyle={{ borderRadius: 18, boxShadow: '0 2px 12px #0002', background: '#181b22', width: '100%', height: '100%' }}
      />
    </div>
  );
}
