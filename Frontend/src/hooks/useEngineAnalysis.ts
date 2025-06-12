import { useEffect } from 'react';
import { parseStockfishLine, getTurnFromFen } from '../stockfishHelpers';
import { Chess } from 'chess.js';

export function useEngineAnalysis({
  fen,
  engineOn,
  maxDepth,
  showArrowsRef,
  setEvalScore,
  setEvalDisplay,
  setEngineOutput,
  setArrow,
  bestMoveRef,
  bestMoveAtMaxDepthRef,
  workerRef,
  SLIDER_MIN,
  SLIDER_MAX,
  resetEngineDisplay,
}: any) {
  useEffect(() => {
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
      engine = new window.Worker('/stockfish.js', { type: 'classic' });
      workerRef.current = engine;
    } catch (err: any) {
      setEngineOutput(`Failed to load Stockfish worker: ${err.message}\n`);
      return;
    }
    engine.onmessage = (event: MessageEvent) => {
      const line = event.data;
      const turn = getTurnFromFen(fen);
      const parsed = parseStockfishLine(line);
      if (line.startsWith('info')) {
        if (parsed.depth) {
          depth = parsed.depth.toString();
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
    engine.onerror = (err: any) => {
      setEngineOutput(`Worker error: ${err.message}\n`);
      engine.terminate();
      if (workerRef.current === engine) workerRef.current = null;
    };
    engine.postMessage('uci');
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage(`go depth ${maxDepth}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, engineOn, maxDepth]);
}
