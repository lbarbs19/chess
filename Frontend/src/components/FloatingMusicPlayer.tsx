import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator";

export default function FloatingMusicPlayer() {
  // --- Draggable State ---
  const [pos, setPos] = useState({ x: window.innerWidth - 360, y: window.innerHeight - 200 });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [minimized, setMinimized] = useState(true);
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
      background: '#191414', // Spotify dark gray
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
      onMouseDown={onDragStart}
      onClick={e => {
        if (minimized && !dragging && !dragStarted.current && !pendingExpand) {
          e.stopPropagation();
          handleExpand();
        }
      }}
    >
      {/* Spotify Logo: always rendered, fades in as minimized */}
      <motion.img
        src="/spotify-2-logo-svg-vector.svg"
        alt="Spotify logo"
        style={{
          position: 'absolute',
          inset: 0,
          margin: 'auto',
          pointerEvents: 'none',
          width: 28,
          height: 28,
          objectFit: 'cover',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
        }}
        initial={false}
        animate={{
          opacity: minimized || pendingMinimize ? 1 : 0,
          scale: minimized || pendingMinimize ? 1 : 0.7,
          transition: { duration: 0.18 }
        }}
      />
      {/* Player content: fades out as minimized, but always mounted to keep iframe loaded */}
      <motion.div
        style={{ width: '100%', height: '100%', position: 'relative', pointerEvents: minimized && !pendingExpand ? 'none' : 'auto', zIndex: 1, flexDirection: 'column', display: 'flex' }}
        initial={false}
        animate={{
          opacity: minimized || pendingMinimize ? 0 : 1,
          scale: minimized || pendingMinimize ? 0.95 : 1,
          transition: { duration: 0.18 }
        }}
      >
        <motion.div
          style={{
            width: '100%',
            height: 28,
            cursor: dragging ? 'grabbing' : 'grab',
            background: 'rgba(0,0,0,0.18)',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            userSelect: 'none',
            paddingRight: 8,
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
          }}
          initial={false}
          animate={{
            y: minimized || pendingMinimize ? -20 : 0,
            opacity: minimized || pendingMinimize ? 0 : 1,
            transition: { type: 'spring', stiffness: 320, damping: 30, duration: 0.22 }
          }}
        >
          <motion.button
            onClick={e => { e.stopPropagation(); if (!pendingMinimize) handleMinimize(); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 22,
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
              position: 'relative',
              zIndex: 2,
            }}
            whileHover={{ scale: 1.15, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.92 }}
            aria-label="Minimize player"
            title="Minimize"
          >
            <motion.span
              style={{fontWeight: 700, fontSize: 22, lineHeight: 1, display: 'block', marginTop: -2}}
              initial={false}
              animate={{
                rotate: minimized || pendingMinimize ? 90 : 0,
                transition: { type: 'spring', stiffness: 320, damping: 30, duration: 0.22 }
              }}
            >–</motion.span>
          </motion.button>
        </motion.div>
        <iframe
          style={{ borderRadius: 12, minWidth: 200, width: '100%', display: 'block' }}
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