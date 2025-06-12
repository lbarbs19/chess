import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator";

export default function FloatingMusicPlayer() {
  // --- Draggable State ---
  const [pos, setPos] = useState({ x: window.innerWidth - 360, y: window.innerHeight - 200 });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [minimized, setMinimized] = useState(false);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const dragStarted = useRef(false);
  // Remove animating state, use local animating ref for drag/click separation
  const [pendingMinimize, setPendingMinimize] = useState(false);
  const [pendingExpand, setPendingExpand] = useState(false);

  // Only allow dragging from the header
  function onDragStart(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (e.button !== 0) return;
    if (!widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();
    setDragging(true);
    setRel({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    dragStarted.current = false;
    e.preventDefault();
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging) return;
      // Allow dragging across the whole screen, not just a limited area
      const widgetWidth = minimized ? 48 : 340;
      const widgetHeight = minimized ? 48 : 200;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - widgetWidth, e.clientX - rel.x)),
        y: Math.max(0, Math.min(window.innerHeight - widgetHeight, e.clientY - rel.y)),
      });
      dragStarted.current = true;
    }
    function onMouseUp() { setDragging(false); }
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, rel, minimized]);

  // Animation handlers
  function handleMinimize() {
    setPendingMinimize(true);
  }
  function handleExpand() {
    setPendingExpand(true);
  }

  // Animation variants for Framer Motion
  const variants = {
    expanded: {
      width: 340,
      height: 200,
      borderRadius: '18px',
      background: 'rgba(35,39,47,0.98)',
      transition: { type: "spring" as const, stiffness: 260, damping: 25 },
    },
    minimized: {
      width: 48,
      height: 48,
      borderRadius: '50%',
      background: '#1db954',
      transition: { type: "spring" as const, stiffness: 260, damping: 25 },
    },
  };

  // Handle animation completion
  function handleAnimationComplete(definition: string) {
    if (pendingMinimize && minimized === false) {
      setMinimized(true);
      setPendingMinimize(false);
    }
    if (pendingExpand && minimized === true) {
      setMinimized(false);
      setPendingExpand(false);
    }
  }

  return (
    <motion.div
      ref={widgetRef}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        boxShadow: '0 4px 24px #0006',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        userSelect: 'none',
        overflow: 'hidden',
        cursor: dragging ? 'grabbing' : minimized ? 'grab' : undefined,
      }}
      tabIndex={0}
      aria-label={minimized ? 'Expand Spotify player' : 'Floating Spotify player'}
      initial={minimized ? 'minimized' : 'expanded'}
      animate={pendingMinimize ? 'minimized' : pendingExpand ? 'expanded' : minimized ? 'minimized' : 'expanded'}
      variants={variants}
      onAnimationComplete={handleAnimationComplete}
      onMouseDown={minimized ? onDragStart : undefined}
      onClick={e => {
        if (minimized && !dragging && !dragStarted.current && !pendingExpand) {
          e.stopPropagation();
          handleExpand();
        }
      }}
    >
      {/* Spotify Logo: always rendered, fades in as minimized */}
      <motion.svg
        width="28" height="28" viewBox="0 0 28 28" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', pointerEvents: 'none' }}
        initial={false}
        animate={{
          opacity: minimized || pendingMinimize ? 1 : 0,
          scale: minimized || pendingMinimize ? 1 : 0.7,
          transition: { duration: 0.18 }
        }}
      >
        <circle cx="14" cy="14" r="14" fill="#1db954" />
        <path d="M8.5 17.5C12 15.5 16 15.5 19.5 17.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M9.5 14C13 12.5 15.5 12.5 18.5 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10.5 11C13.5 10 15 10 17.5 11" stroke="white" strokeWidth="1" strokeLinecap="round"/>
      </motion.svg>
      {/* Player content: fades out as minimized */}
      <motion.div
        style={{ width: '100%', height: '100%', display: minimized && !pendingExpand ? 'none' : 'flex', flexDirection: 'column' }}
        initial={false}
        animate={{
          opacity: minimized || pendingMinimize ? 0 : 1,
          scale: minimized || pendingMinimize ? 0.95 : 1,
          transition: { duration: 0.18 }
        }}
      >
        <div
          style={{
            width: '100%',
            height: 28,
            cursor: dragging ? 'grabbing' : 'grab',
            background: 'rgba(0,0,0,0.18)',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end', // Remove text, align button right
            userSelect: 'none',
            paddingRight: 8,
            boxSizing: 'border-box',
          }}
          onMouseDown={onDragStart}
        >
          <button
            onClick={e => { e.stopPropagation(); if (!pendingMinimize) handleMinimize(); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 22, // Slightly larger for visual balance
              cursor: 'pointer',
              padding: 0,
              marginLeft: 0,
              width: 24,
              height: 24,
              lineHeight: 1,
              borderRadius: 4,
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Minimize player"
            title="Minimize"
          >
            <span style={{fontWeight: 700, fontSize: 22, lineHeight: 1, display: 'block', marginTop: -2}}>–</span>
          </button>
        </div>
        <iframe
          style={{ borderRadius: 12, minWidth: 200, width: '100%' }}
          src={SPOTIFY_EMBED_URL}
          width="100%"
          height={152}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify Player"
        />
      </motion.div>
    </motion.div>
  );
}