import { useEffect } from 'react';
import { parseStockfishLine, getTurnFromFen } from '../stockfishHelpers';

export function useComputerMode({
  fen,
  computerMode,
  computerDepth,
  lastMoveByComputer,
  handleBoardMove,
  bestMoveRef,
  computerWorkerRef,
  playMoveSound, // <-- add this
}: any) {
  useEffect(() => {
    if (!computerMode) {
      if (computerWorkerRef.current) {
        computerWorkerRef.current.terminate();
        computerWorkerRef.current = null;
      }
      return;
    }
    if (getTurnFromFen(fen) === 'b' && !lastMoveByComputer.current) {
      if (computerWorkerRef.current) {
        computerWorkerRef.current.terminate();
        computerWorkerRef.current = null;
      }
      const worker = new window.Worker('/stockfish.js', { type: 'classic' });
      computerWorkerRef.current = worker;
      let bestMove = '';
      worker.onmessage = (event: MessageEvent) => {
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
              // Get move info for sound
              const moveResult = handleBoardMove(from, to);
              if (playMoveSound && moveResult && typeof moveResult === 'object') {
                playMoveSound({
                  isCheck: !!moveResult.isCheck,
                  isCapture: !!moveResult.isCapture,
                  isCastle: !!moveResult.isCastle,
                });
              }
            }, 400);
          }
          worker.terminate();
          if (computerWorkerRef.current === worker) computerWorkerRef.current = null;
        }
      };
      worker.onerror = () => {
        worker.terminate();
        if (computerWorkerRef.current === worker) computerWorkerRef.current = null;
      };
      worker.postMessage('uci');
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go depth ${computerDepth}`);
    }
    if (getTurnFromFen(fen) === 'w') {
      lastMoveByComputer.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, computerMode, computerDepth]);
}
