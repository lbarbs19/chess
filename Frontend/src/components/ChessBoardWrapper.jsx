import React, { useRef, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';

export default function ChessBoardWrapper({ boardWidth, fen, arrow, onMove }) {
  // Sound refs
  const moveSoundRef = useRef(null);
  const captureSoundRef = useRef(null);

  useEffect(() => {
    moveSoundRef.current = new window.Audio('/sound/move-self.mp3');
    captureSoundRef.current = new window.Audio('/sound/capture.mp3');
    moveSoundRef.current.load();
    captureSoundRef.current.load();
  }, []);

  // Play move/capture sound
  function playMoveSound(isCapture) {
    if (isCapture) {
      if (captureSoundRef.current) {
        captureSoundRef.current.currentTime = 0;
        captureSoundRef.current.play();
      }
    } else {
      if (moveSoundRef.current) {
        moveSoundRef.current.currentTime = 0;
        moveSoundRef.current.play();
      }
    }
  }

  // Handle piece drop and sound, then notify parent
  function handleDrop(sourceSquare, targetSquare) {
    // Parent must provide a function that returns { move, isCapture } or false
    const result = onMove(sourceSquare, targetSquare);
    if (result && typeof result === 'object') {
      playMoveSound(result.isCapture);
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
        boardHeight={boardWidth}
        position={fen}
        onPieceDrop={handleDrop}
        customArrows={arrow}
        boardStyle={{ borderRadius: 18, boxShadow: '0 2px 12px #0002', background: '#181b22', width: '100%', height: '100%' }}
      />
    </div>
  );
}
