import { useState, useEffect } from 'react';

// Add evalBarWidth as a parameter (default 48px)
export function useBoardWidth(controlsWidth: number, evalBarWidth: number = 48) {
  const [boardWidth, setBoardWidth] = useState(() => {
    const vw = Math.floor(window.innerWidth * 0.9) - controlsWidth - evalBarWidth;
    const vh = Math.floor(window.innerHeight * 0.9);
    return Math.max(240, Math.min(900, vw, vh));
  });

  useEffect(() => {
    function handleResize() {
      const vw = Math.floor(window.innerWidth * 0.9) - controlsWidth - evalBarWidth -200;
      const vh = Math.floor(window.innerHeight * 0.9);
      setBoardWidth(Math.max(240, Math.min(900, vw, vh)));
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [controlsWidth, evalBarWidth]);

  return boardWidth;
}
