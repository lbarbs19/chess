// src/stockfishHelpers.js

/**
 * Parses Stockfish 'info' and 'bestmove' lines and extracts relevant data.
 * Returns an object with depth, bestMove, eval, mate, etc.
 */
export type StockfishLineResult = {
  depth?: number;
  bestMove?: string;
  eval?: number;
  mate?: number;
};

export function parseStockfishLine(line: string): StockfishLineResult {
  const result: StockfishLineResult = {};
  if (typeof line !== 'string') return result;
  if (line.startsWith('info')) {
    const depthMatch = line.match(/\bdepth (\d+)/);
    if (depthMatch) result.depth = parseInt(depthMatch[1], 10);
    const pvMatch = line.match(/\bpv\s+([a-h][1-8][a-h][1-8][qrbn]?)/);
    if (pvMatch) result.bestMove = pvMatch[1];
    const evalMatch = line.match(/score (cp|mate) (-?\d+)/);
    if (evalMatch) {
      if (evalMatch[1] === 'cp') {
        result.eval = parseInt(evalMatch[2], 10);
      } else if (evalMatch[1] === 'mate') {
        result.mate = parseInt(evalMatch[2], 10);
      }
    }
  } else if (line.startsWith('bestmove')) {
    const moveMatch = line.match(/^bestmove (\S+)/);
    if (moveMatch) result.bestMove = moveMatch[1];
  }
  return result;
}

/**
 * Utility to get the turn from a FEN string ('w' or 'b').
 */
export function getTurnFromFen(fen: string): 'w' | 'b' {
  const turn = fen.split(' ')[1];
  if (turn === 'w' || turn === 'b') return turn;
  throw new Error('Invalid FEN: cannot determine turn');
}
