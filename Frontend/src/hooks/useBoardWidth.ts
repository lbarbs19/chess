import { useState, useEffect } from 'react';

export function useBoardWidth(controlsWidth: number) {
  const [boardWidth, setBoardWidth] = useState(() => {
    const vw = Math.floor(window.innerWidth * 0.9) - controlsWidth;
    const vh = Math.floor(window.innerHeight * 0.9);
    return Math.max(240, Math.min(900, vw, vh));
  });

  useEffect(() => {
    function handleResize() {
      const vw = Math.floor(window.innerWidth * 0.9) - controlsWidth;
      const vh = Math.floor(window.innerHeight * 0.9);
      setBoardWidth(Math.max(240, Math.min(900, vw, vh)));
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [controlsWidth]);

  return boardWidth;
}
