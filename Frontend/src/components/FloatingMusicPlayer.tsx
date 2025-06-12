import React, { useState, useRef, useEffect } from 'react';

const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator";

export default function FloatingMusicPlayer() {
  // --- Draggable State ---
  const [pos, setPos] = useState({ x: window.innerWidth - 360, y: window.innerHeight - 200 });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [minimized, setMinimized] = useState(false); // Add minimized state
  const widgetRef = useRef<HTMLDivElement | null>(null);

  // Only allow dragging from the header
  function onDragStart(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (e.button !== 0) return;
    if (!widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();
    setDragging(true);
    setRel({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    e.preventDefault();
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging) return;
      setPos({
        x: Math.max(12, Math.min(window.innerWidth - 360, e.clientX - rel.x)),
        y: Math.max(12, Math.min(window.innerHeight - (minimized ? 40 : 200), e.clientY - rel.y)),
      });
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

  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: 340,
        background: 'rgba(35,39,47,0.98)',
        borderRadius: 18,
        boxShadow: '0 4px 24px #0006',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 0,
        userSelect: 'none',
        transition: 'box-shadow 0.15s',
        height: minimized ? 40 : undefined, // Shrink height when minimized
      }}
      tabIndex={0}
      aria-label="Floating Spotify player"
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
          justifyContent: 'space-between', // Space for button
          fontWeight: 600,
          color: '#fff',
          letterSpacing: 1,
          userSelect: 'none',
          paddingLeft: 12,
          paddingRight: 8,
        }}
        onMouseDown={onDragStart}
      >
        <span>Spotify Player</span>
        <button
          onClick={e => { e.stopPropagation(); setMinimized(m => !m); }}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 18,
            cursor: 'pointer',
            padding: 0,
            marginLeft: 8,
            width: 24,
            height: 24,
            lineHeight: 1,
            borderRadius: 4,
            transition: 'background 0.2s',
          }}
          aria-label={minimized ? 'Expand player' : 'Minimize player'}
          title={minimized ? 'Expand' : 'Minimize'}
        >
          {minimized ? '▢' : '—'}
        </button>
      </div>
      {/* Only show the iframe if not minimized */}
      {!minimized && (
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
      )}
    </div>
  );
}