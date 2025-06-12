declare module "./stockfishHelpers" {
  export function parseStockfishLine(line: string): any;
  export function getTurnFromFen(fen: string): string;
}
