import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import ChessBoardWrapper from './components/ChessBoardWrapper';
import { parseStockfishLine, getTurnFromFen } from './stockfishHelpers';
import './App.css';
import BoardControls from './components/BoardControls';
import EvalBarOverlay from './components/EvalBarOverlay';
import FloatingMusicPlayer from './components/FloatingMusicPlayer';
import Sidebar from './components/Sidebar';
import { sidebarIcons } from './components/SidebarIcons';
import { useBoardWidth } from './hooks/useBoardWidth';
import { useEngineAnalysis } from './hooks/useEngineAnalysis';
import { useComputerMode } from './hooks/useComputerMode';
import { useSidebar } from './hooks/useSidebar';

// Main App component
function App() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState<string>(game.fen());
  const [engineOutput, setEngineOutput] = useState<string>("");
  const [arrow, setArrow] = useState<any[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([game.fen()]);
  const [moveIndex, setMoveIndex] = useState<number>(0);
  const [engineOn, setEngineOn] = useState<boolean>(true);
  const [showEval, setShowEval] = useState<boolean>(true); // Controls eval bar
  const [showArrows, setShowArrows] = useState<boolean>(true); // Controls arrows
  const showArrowsRef = useRef(showArrows);
  useEffect(() => {
    showArrowsRef.current = showArrows;
  }, [showArrows]);
  const [evalScore, setEvalScore] = useState<number>(0);
  const [evalDisplay, setEvalDisplay] = useState<string>('0.00');
  const [maxDepth, setMaxDepth] = useState<number>(20); // For depth slider
  const [computerMode, setComputerMode] = useState<boolean>(false); // For computer mode
  const [computerDepth, setComputerDepth] = useState<number>(10); // Separate computer depth
  const workerRef = useRef<any>(null);
  const computerWorkerRef = useRef<any>(null); // Separate worker for computer mode
  const bestMoveRef = useRef<string>('');
  const bestMoveAtMaxDepthRef = useRef<string>('');
  const lastMoveByComputer = useRef<boolean>(false);
  const SLIDER_MIN = -10, SLIDER_MAX = 10;
  const [lastBestMove, setLastBestMove] = useState<any[] | null>(null);

  // --- Sound effect refs and logic (moved from ChessBoardWrapper) ---
  const moveSoundRef = useRef<HTMLAudioElement | null>(null);
  const captureSoundRef = useRef<HTMLAudioElement | null>(null);
  const checkSoundRef = useRef<HTMLAudioElement | null>(null);
  const castleSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    moveSoundRef.current = new window.Audio('/sound/move-self.mp3');
    captureSoundRef.current = new window.Audio('/sound/capture.mp3');
    checkSoundRef.current = new window.Audio('/sound/move-check.mp3');
    castleSoundRef.current = new window.Audio('/sound/castle.mp3');
    moveSoundRef.current?.load();
    captureSoundRef.current?.load();
    checkSoundRef.current?.load();
    castleSoundRef.current?.load();
  }, []);

  // Play move sound with priority: check > capture > castle > move
  function playMoveSound({ isCheck, isCapture, isCastle }: { isCheck?: boolean; isCapture?: boolean; isCastle?: boolean }) {
    if (isCheck && checkSoundRef.current) {
      checkSoundRef.current.currentTime = 0;
      checkSoundRef.current.play();
    } else if (isCapture && captureSoundRef.current) {
      captureSoundRef.current.currentTime = 0;
      captureSoundRef.current.play();
    } else if (isCastle && castleSoundRef.current) {
      castleSoundRef.current.currentTime = 0;
      castleSoundRef.current.play();
    } else if (moveSoundRef.current) {
      moveSoundRef.current.currentTime = 0;
      moveSoundRef.current.play();
    }
  }

  function resetEngineDisplay() {
    workerRef.current?.terminate();
    workerRef.current = null;
    setEngineOutput('Engine off');
    setArrow([]);
    setEvalScore(0);
    setEvalDisplay('0.00');
  }

  // Board move handler
  function handleBoardMove(sourceSquare: string, targetSquare: string) {
    try {
      const newGame = new Chess(fen);
      const moveObj = newGame.moves({ verbose: true }).find((m: any) => m.from === sourceSquare && m.to === targetSquare);
      const isCapture = !!(moveObj && (moveObj.captured || moveObj.flags.includes('e')));
      const isCastle = !!(moveObj && (moveObj.flags.includes('k') || moveObj.flags.includes('q')));
      const move = newGame.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      if (!move) return false;
      // Check if the move results in check
      const isCheck = newGame.inCheck();
      // Play sound for user move
      playMoveSound({ isCheck, isCapture, isCastle });
      bestMoveRef.current = '';
      bestMoveAtMaxDepthRef.current = '';
      lastMoveByComputer.current = false;
      const newFen = newGame.fen();
      setFen(newFen);
      setGame(newGame);
      const newHistory = moveHistory.slice(0, moveIndex + 1).concat([newFen]);
      setMoveHistory(newHistory);
      setMoveIndex(newHistory.length - 1);
      return { move, isCapture, isCastle, isCheck };
    } catch {
      return false;
    }
  }

  // Move navigation handler
  function goToMove(index: number) {
    if (index < 0 || index >= moveHistory.length) return;
    bestMoveRef.current = '';
    bestMoveAtMaxDepthRef.current = '';
    setMoveIndex(index);
    setFen(moveHistory[index]);
    setGame(new Chess(moveHistory[index]));
    // Engine analysis is now handled by useEngineAnalysis
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToMove(moveIndex - 1);
      else if (e.key === "ArrowRight") goToMove(moveIndex + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveIndex, moveHistory.length]);

  // Sidebar hover/lock state and handlers
  const {
    sidebarHovered,
    sidebarLocked,
    handleSidebarAreaEnter,
    handleSidebarAreaLeave,
    handleSidebarTabClick,
  } = useSidebar();

  // Board width
  const CONTROLS_WIDTH = 260 + 36;
  const boardWidth = useBoardWidth(CONTROLS_WIDTH);

  // Engine analysis
  useEngineAnalysis({
    fen,
    engineOn,
    maxDepth,
    showArrowsRef,
    setEvalScore,
    setEvalDisplay,
    setEngineOutput,
    setArrow: (arrows: any[]) => {
      setArrow(arrows);
      if (arrows && arrows.length && arrows[0][0] && arrows[0][1]) {
        setLastBestMove([arrows[0][0], arrows[0][1], arrows[0][2] || 'blue']);
      }
    },
    bestMoveRef,
    bestMoveAtMaxDepthRef,
    workerRef,
    SLIDER_MIN,
    SLIDER_MAX,
    resetEngineDisplay,
  });

  // Computer mode
  useComputerMode({
    fen,
    computerMode,
    computerDepth,
    lastMoveByComputer,
    handleBoardMove,
    bestMoveRef,
    computerWorkerRef,
    playMoveSound, // pass sound effect function for computer moves
  });

  // When showArrows is toggled ON, immediately show the last best move arrow if available
  useEffect(() => {
    if (showArrows && lastBestMove) {
      setArrow([lastBestMove]);
    } else if (!showArrows) {
      setArrow([]);
    }
  }, [showArrows, lastBestMove]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      minHeight: '100vh',
      width: '100vw',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Sidebar at the very left edge, flush with top and bottom */}
      <Sidebar
        icons={sidebarIcons}
        hovered={sidebarHovered}
        locked={sidebarLocked}
        onAreaEnter={handleSidebarAreaEnter}
        onAreaLeave={handleSidebarAreaLeave}
        onTabClick={handleSidebarTabClick}
      />
      {/* Main content area, takes up remaining space */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 0',
        zIndex: 1
      }}>
        {/* Floating music player widget (inside main content) */}
        <FloatingMusicPlayer />
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          width: '100%',
          justifyContent: 'center',
        }}>
          <EvalBarOverlay
            engineOn={engineOn}
            showEval={showEval}
            evalScore={evalScore}
            evalDisplay={evalDisplay}
            SLIDER_MIN={SLIDER_MIN}
            SLIDER_MAX={SLIDER_MAX}
            boardWidth={boardWidth}
          />
          <ChessBoardWrapper
            boardWidth={boardWidth}
            fen={fen}
            onMove={handleBoardMove}
            arrow={arrow}
            playMoveSound={playMoveSound}
          />
          <BoardControls
            engineOn={engineOn}
            setEngineOn={setEngineOn}
            showEval={showEval}
            setShowEval={setShowEval}
            showArrows={showArrows}
            setShowArrows={setShowArrows}
            maxDepth={maxDepth}
            setMaxDepth={setMaxDepth}
            engineOutput={engineOutput}
            moveIndex={moveIndex}
            moveHistory={moveHistory}
            goToMove={goToMove}
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