import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import ChessBoardWrapper from './components/ChessBoardWrapper';
import { parseStockfishLine, getTurnFromFen } from './stockfishHelpers';
import './App.css';
import EngineControls from './components/EngineControls';
import MoveNav from './components/MoveNav';
import ComputerControls from './components/ComputerControls';
import EvalBar from './components/EvalBar';
import FloatingMusicPlayer from './components/FloatingMusicPlayer';
import SidebarButton from './components/SidebarButton';

// Main App component
function App() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [engineOutput, setEngineOutput] = useState("");
  const [arrow, setArrow] = useState([]);
  const [moveHistory, setMoveHistory] = useState([game.fen()]);
  const [moveIndex, setMoveIndex] = useState(0);
  const [engineOn, setEngineOn] = useState(true);
  const [showEval, setShowEval] = useState(true); // Controls eval bar
  const [showArrows, setShowArrows] = useState(true); // Controls arrows
  const showArrowsRef = useRef(showArrows);
  const [evalScore, setEvalScore] = useState(0);
  const [evalDisplay, setEvalDisplay] = useState('0.00');
  const [maxDepth, setMaxDepth] = useState(20); // For depth slider
  const [computerMode, setComputerMode] = useState(false); // For computer mode
  const [computerDepth, setComputerDepth] = useState(10); // Separate computer depth
  const workerRef = useRef(null);
  const computerWorkerRef = useRef(null); // Separate worker for computer mode
  const bestMoveRef = useRef('');
  const bestMoveAtMaxDepthRef = useRef('');
  const lastMoveByComputer = useRef(false);
  const SLIDER_MIN = -10, SLIDER_MAX = 10;

  // Helper: play move/capture sound
  function playMoveSound(isCapture) {
    // Intentionally left blank: sound logic removed from App
  }

  function resetEngineDisplay() {
    workerRef.current?.terminate();
    workerRef.current = null;
    setEngineOutput('Engine off');
    setArrow([]);
    setEvalScore(0);
    setEvalDisplay('0.00');
  }

  // Replace onDrop with onMove for ChessBoardWrapper
  function handleBoardMove(sourceSquare, targetSquare) {
    try {
      const newGame = new Chess(fen);
      const moveObj = newGame.moves({ verbose: true }).find(m => m.from === sourceSquare && m.to === targetSquare);
      const isCapture = moveObj && (moveObj.captured || moveObj.flags.includes('e'));
      const move = newGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      if (!move) return false;
      bestMoveRef.current = '';
      bestMoveAtMaxDepthRef.current = '';
      lastMoveByComputer.current = false;
      const newFen = newGame.fen();
      setFen(newFen);
      setGame(newGame);
      const newHistory = moveHistory.slice(0, moveIndex + 1).concat([newFen]);
      setMoveHistory(newHistory);
      setMoveIndex(newHistory.length - 1);
      if (engineOn) {
        analyzePosition(newFen);
        if (!showEval) setArrow([]);
      } else {
        resetEngineDisplay();
      }
      return { move, isCapture };
    } catch {
      return false;
    }
  }

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "ArrowLeft") goToMove(moveIndex - 1);
      else if (e.key === "ArrowRight") goToMove(moveIndex + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveIndex, moveHistory.length]);

  useEffect(() => {
    if (engineOn) analyzePosition(fen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineOn]);

  useEffect(() => {
    if (
      engineOn &&
      computerMode &&
      getTurnFromFen(fen) === 'b' &&
      !lastMoveByComputer.current
    ) {
      analyzePosition(fen);
    }
    if (getTurnFromFen(fen) === 'w') {
      lastMoveByComputer.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, computerMode, engineOn]);

  // Handle clearing arrows when showArrows or engineOn is toggled off, and restoring arrow when toggled on
  useEffect(() => {
    if (!engineOn || !showArrows) {
      setArrow([]);
    } else if (bestMoveRef.current && bestMoveRef.current.length >= 4) {
      setArrow([[bestMoveRef.current.slice(0, 2), bestMoveRef.current.slice(2, 4), 'blue']]);
    }
  }, [showArrows, engineOn]);

  // Handle clearing eval/arrows and terminating engine when engine is turned off
  useEffect(() => {
    if (!engineOn) {
      resetEngineDisplay();
    }
  }, [engineOn]);

  // Responsive board width: up to 90vw, 90vh, max 900px, always square, and leaves room for controls
  const CONTROLS_WIDTH = 260 + 36; // controls card + gap
  const [boardWidth, setBoardWidth] = useState(() => {
    const vw = Math.floor(window.innerWidth * 0.9) - CONTROLS_WIDTH;
    const vh = Math.floor(window.innerHeight * 0.9);
    return Math.max(240, Math.min(900, vw, vh));
  });
  useEffect(() => {
    function handleResize() {
      const vw = Math.floor(window.innerWidth * 0.9) - CONTROLS_WIDTH;
      const vh = Math.floor(window.innerHeight * 0.9);
      setBoardWidth(Math.max(240, Math.min(900, vw, vh)));
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    showArrowsRef.current = showArrows;
  }, [showArrows]);

  function analyzePosition(fen, isComputerMove = false) {
    if (!engineOn) return resetEngineDisplay();
    const chess = new Chess(fen);
    if (chess.isGameOver()) {
      setEvalScore(0);
      setEvalDisplay('-');
      setEngineOutput('Game over');
      setArrow([]);
      return;
    }
    let depth = '';
    workerRef.current?.terminate();
    let engine;
    try {
      engine = new window.Worker("/stockfish.js", { type: "classic" });
      workerRef.current = engine;
    } catch (err) {
      setEngineOutput(`Failed to load Stockfish worker: ${err.message}\n`);
      return;
    }
    engine.onmessage = event => {
      const line = event.data;
      const turn = getTurnFromFen(fen);
      const parsed = parseStockfishLine(line);
      if (line.startsWith('info')) {
        if (parsed.depth) {
          depth = parsed.depth;
          if (parsed.depth === maxDepth && parsed.bestMove) {
            bestMoveAtMaxDepthRef.current = parsed.bestMove;
          }
        }
        if (parsed.bestMove) {
          bestMoveRef.current = parsed.bestMove;
          if (engineOn && showArrowsRef.current) {
            setArrow([[parsed.bestMove.slice(0, 2), parsed.bestMove.slice(2, 4), 'blue']]);
          } else {
            setArrow([]);
          }
        } else {
          setArrow([]);
        }
        if (parsed.eval !== undefined) {
          let cp = parsed.eval;
          let score = Math.max(SLIDER_MIN * 100, Math.min(SLIDER_MAX * 100, cp)) / 100;
          const trueScore = (turn === 'b' ? -cp : cp) / 100;
          setEvalScore(turn === 'b' ? -score : score);
          setEvalDisplay((trueScore > 0 ? '+' : '') + trueScore.toFixed(2));
        } else if (parsed.mate !== undefined) {
          let mate = parsed.mate;
          let displayMate = turn === 'b' ? -mate : mate;
          let mateScore = displayMate > 0 ? SLIDER_MAX : SLIDER_MIN;
          setEvalScore(mateScore);
          setEvalDisplay(displayMate > 0 ? `+M${displayMate}` : `-M${Math.abs(displayMate)}`);
        }
      }
      if (line.startsWith('bestmove')) {
        if (parsed.bestMove) {
          bestMoveRef.current = parsed.bestMove;
          if (engineOn && showArrowsRef.current) {
            setArrow([[parsed.bestMove.slice(0, 2), parsed.bestMove.slice(2, 4), 'blue']]);
          } else {
            setArrow([]);
          }
        } else {
          setArrow([]);
        }
        engine.terminate();
        if (workerRef.current === engine) workerRef.current = null;
      }
      setEngineOutput(`${depth ? `Depth: ${depth}` : 'Depth: ...'}`);
    };
    engine.onerror = err => {
      setEngineOutput(`Worker error: ${err.message}\n`);
      engine.terminate();
      if (workerRef.current === engine) workerRef.current = null;
    };
    engine.postMessage("uci");
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage(`go depth ${maxDepth}`);
  }

  function goToMove(index) {
    if (index < 0 || index >= moveHistory.length) return;
    bestMoveRef.current = '';
    bestMoveAtMaxDepthRef.current = '';
    setMoveIndex(index);
    setFen(moveHistory[index]);
    setGame(new Chess(moveHistory[index]));
    engineOn ? analyzePosition(moveHistory[index]) : resetEngineDisplay();
  }

  // Sidebar hover and lock state for fast, responsive animation
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarLocked, setSidebarLocked] = useState(false);

  // Sidebar icons (dummy)
  const sidebarIcons = [
    { icon: '🏠', label: 'Home' },
    { icon: '♟️', label: 'Play' },
    { icon: '📈', label: 'Analysis' },
    { icon: '⚙️', label: 'Settings' },
  ];

  // Sidebar hover handlers (hovering sidebar or tab keeps open)
  const handleSidebarAreaEnter = () => { if (!sidebarLocked) setSidebarHovered(true); };
  const handleSidebarAreaLeave = () => { if (!sidebarLocked) setSidebarHovered(false); };
  const handleSidebarTabClick = () => setSidebarLocked(locked => !locked);

  // Remove computerMode logic from main engine's analyzePosition
  // Add a new effect for computer mode to play for black using its own worker and depth
  useEffect(() => {
    if (!computerMode) {
      if (computerWorkerRef.current) {
        computerWorkerRef.current.terminate();
        computerWorkerRef.current = null;
      }
      return;
    }
    if (getTurnFromFen(fen) === 'b' && !lastMoveByComputer.current) {
      // Start computer worker for black
      if (computerWorkerRef.current) {
        computerWorkerRef.current.terminate();
        computerWorkerRef.current = null;
      }
      const worker = new window.Worker("/stockfish.js", { type: "classic" });
      computerWorkerRef.current = worker;
      let bestMove = '';
      worker.onmessage = event => {
        const line = event.data;
        const parsed = parseStockfishLine(line);
        if (line.startsWith('info') && parsed.depth === computerDepth && parsed.bestMove) {
          bestMove = parsed.bestMove;
        }
        if (line.startsWith('bestmove')) {
          if (bestMove && bestMove.length >= 4) {
            setTimeout(() => {
              lastMoveByComputer.current = true;
              const from = bestMove.slice(0, 2);
              const to = bestMove.slice(2, 4);
              // Use handleBoardMove so board and state update correctly
              handleBoardMove(from, to);
            }, 400);
          }
          worker.terminate();
          if (computerWorkerRef.current === worker) computerWorkerRef.current = null;
        }
      };
      worker.onerror = err => {
        worker.terminate();
        if (computerWorkerRef.current === worker) computerWorkerRef.current = null;
      };
      worker.postMessage("uci");
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go depth ${computerDepth}`);
    }
    if (getTurnFromFen(fen) === 'w') {
      lastMoveByComputer.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, computerMode, computerDepth]);

  return (
    <div style={{
      minHeight: '100vh',
      minWidth: '100vw',
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #23272f 0%, #2d3340 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'auto',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 0
    }}>
      {/* Floating music player widget */}
      <FloatingMusicPlayer />
      {/* Sidebar area: sidebar slides in/out on hover/focus, tab moves with sidebar */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '90vh',
          maxHeight: 800,
          minWidth: 0,
        }}
        onMouseEnter={handleSidebarAreaEnter}
        onMouseLeave={handleSidebarAreaLeave}
        onFocus={handleSidebarAreaEnter}
        onBlur={handleSidebarAreaLeave}
        tabIndex={-1}
      >
        {/* Sidebar panel with attached tab */}
        <div
          style={{
            position: 'absolute',
            left: (sidebarHovered || sidebarLocked) ? 0 : -64,
            top: 0,
            width: 80,
            minWidth: 80,
            height: '100%',
            background: 'rgba(35,39,47,0.98)',
            borderRadius: 22,
            margin: '0 24px 0 0',
            boxShadow: '0 4px 24px #0004',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 0 18px 0',
            transition: 'left 180ms cubic-bezier(.77,0,.18,1)',
            cursor: 'pointer',
            overflow: 'visible',
            willChange: 'left',
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #5ecb8c 0%, #2d3340 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 900,
              color: '#fff',
              boxShadow: sidebarHovered ? '0 4px 16px #5ecb8c44' : '0 2px 8px #0002',
              userSelect: 'none',
              transition: 'box-shadow 0.15s',
            }}>
              <span role="img" aria-label="logo">♛</span>
            </div>
          </div>
          {/* Nav icons with interactivity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, flex: 1, justifyContent: 'center', width: '100%' }}>
            {sidebarIcons.map((item, idx) => (
              <SidebarButton key={item.label} icon={item.icon} label={item.label} active={idx === 0} />
            ))}
          </div>
          {/* User avatar placeholder */}
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #b0b8c1 0%, #23272f 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: '#fff',
            fontWeight: 700,
            boxShadow: sidebarHovered ? '0 2px 8px #b0b8c144' : '0 1px 4px #0002',
            userSelect: 'none',
            transition: 'box-shadow 0.15s',
          }}>
            <span role="img" aria-label="avatar">👤</span>
          </div>
          {/* Sidebar tab: attached to sidebar, moves with it */}
          <div
            style={{
              position: 'absolute',
              right: -24,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 24,
              height: 64,
              background: 'rgba(35,39,47,0.98)',
              borderRadius: '0 16px 16px 0',
              boxShadow: '0 2px 8px #0002',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 3,
              borderLeft: '2px solid #23272f',
              transition: 'background 0.12s',
              outline: 'none',
            }}
            tabIndex={0}
            aria-label={sidebarLocked ? 'Unlock sidebar' : 'Lock sidebar'}
            onMouseEnter={handleSidebarAreaEnter}
            onFocus={handleSidebarAreaEnter}
            onBlur={handleSidebarAreaLeave}
            onClick={handleSidebarTabClick}
          >
            <span style={{
              color: '#5ecb8c',
              fontSize: 22,
              fontWeight: 700,
              userSelect: 'none',
              transform: sidebarLocked ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.12s, color 0.12s',
            }}>❯</span>
          </div>
        </div>
      </div>
      {/* Main content */}
      <div style={{
        position: 'relative', // Make this container relative for absolute eval bar
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 0,
        width: '100%',
        maxWidth: 1200,
        justifyContent: 'center',
        margin: '0 auto',
        padding: '32px 0',
        zIndex: 1
      }}>
        {/* Eval bar overlays left of board, absolutely positioned and aligned with the top of the board */}
        <div style={{
          position: 'absolute',
          left: 'calc(50% - ' + (boardWidth / 2 + 48 + 140) + 'px)', // 48px (bar width) + 140px gap to the left of the board
          top: 32,
          height: boardWidth,
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 10,
          opacity: engineOn && showEval ? 1 : 0,
          transition: 'opacity 0.25s',
        }}>
          <EvalBar
            show={engineOn && showEval}
            evalScore={evalScore}
            evalDisplay={evalDisplay}
            SLIDER_MIN={SLIDER_MIN}
            SLIDER_MAX={SLIDER_MAX}
            boardWidth={boardWidth}
          />
        </div>
        {/* Board */}
        <ChessBoardWrapper
          boardWidth={boardWidth}
          fen={fen}
          onMove={handleBoardMove}
          arrow={arrow}
        />
        {/* Controls column: stack engine controls and computer controls vertically */}
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
            marginBottom: 18 // Add space below this card
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: '#fff', letterSpacing: 0.5 }}>Engine Controls</div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, whiteSpace: 'pre', minHeight: 40, maxHeight: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#22252b', borderRadius: 8, padding: 8, boxShadow: '0 1px 4px #0001', marginBottom: 8 }}>
              {/* Only show depth, not best move */}
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
      </div>
    </div>
  );
}

export default App;