import React, { useState, useEffect, useRef } from 'react';

export default function FloatingMusicPlayer() {
  // --- Spotify Integration State ---
  const [pos, setPos] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 180 });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [playing, setPlaying] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [spotifyUser, setSpotifyUser] = useState(null);
  const [spotifyTrack, setSpotifyTrack] = useState(null);
  const widgetRef = useRef(null);

  // --- Spotify OAuth Config ---
  const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID'; // TODO: Replace with your Spotify client ID
  const SPOTIFY_REDIRECT_URI = window.location.origin + '/'; // Must match your Spotify app settings
  const SPOTIFY_SCOPES = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming';

  // --- Handle Dragging ---
  useEffect(() => {
    function onMouseMove(e) {
      if (!dragging) return;
      setPos({
        x: Math.max(12, Math.min(window.innerWidth - 300, e.clientX - rel.x)),
        y: Math.max(12, Math.min(window.innerHeight - 90, e.clientY - rel.y)),
      });
    }
    function onMouseUp() { setDragging(false); }
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, rel]);

  function onDragStart(e) {
    if (e.button !== 0) return;
    const rect = widgetRef.current.getBoundingClientRect();
    setDragging(true);
    setRel({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    e.preventDefault();
  }

  // --- Spotify OAuth Flow ---
  useEffect(() => {
    // Check for access_token in URL hash (after redirect)
    if (window.location.hash.includes('access_token')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        setSpotifyToken(token);
        window.location.hash = '';
      }
    }
  }, []);

  // Fetch Spotify user info if token is set
  useEffect(() => {
    if (!spotifyToken) return;
    fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${spotifyToken}` }
    })
      .then(res => res.json())
      .then(data => setSpotifyUser(data))
      .catch(() => setSpotifyUser(null));
  }, [spotifyToken]);

  // Fetch current track info
  useEffect(() => {
    if (!spotifyToken) return;
    const fetchTrack = () => {
      fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${spotifyToken}` }
      })
        .then(res => res.status === 200 ? res.json() : null)
        .then(data => setSpotifyTrack(data))
        .catch(() => setSpotifyTrack(null));
    };
    fetchTrack();
    const interval = setInterval(fetchTrack, 5000);
    return () => clearInterval(interval);
  }, [spotifyToken]);

  // Play/Pause Spotify
  const handleSpotifyPlayPause = () => {
    if (!spotifyToken) return;
    fetch(`https://api.spotify.com/v1/me/player/${playing ? 'pause' : 'play'}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${spotifyToken}` }
    }).then(() => setPlaying(p => !p));
  };

  // --- UI ---
  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: 320,
        minHeight: 80,
        background: 'rgba(35,39,47,0.98)',
        borderRadius: 18,
        boxShadow: '0 4px 24px #0006',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '12px 18px',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: 'box-shadow 0.15s',
      }}
      onMouseDown={onDragStart}
      tabIndex={0}
      aria-label="Floating music player"
    >
      <div style={{ marginRight: 16, fontSize: 28, color: '#5ecb8c', display: 'flex', alignItems: 'center' }}>
        <span role="img" aria-label="music">🎵</span>
      </div>
      <div style={{ flex: 1, color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: 0.2 }}>
        {spotifyToken && spotifyUser ? (
          <>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Spotify: {spotifyUser.display_name}</div>
            {spotifyTrack && spotifyTrack.item ? (
              <div style={{ fontWeight: 400, fontSize: 13, color: '#b0b8c1', marginTop: 2 }}>
                <div style={{ fontWeight: 600 }}>{spotifyTrack.item.name}</div>
                <div>{spotifyTrack.item.artists.map(a => a.name).join(', ')}</div>
              </div>
            ) : (
              <div style={{ fontWeight: 400, fontSize: 13, color: '#b0b8c1', marginTop: 2 }}>
                No track playing
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Music Player</div>
            <div style={{ fontWeight: 400, fontSize: 13, color: '#b0b8c1', marginTop: 2 }}>
              Connect to Spotify to play music
            </div>
          </>
        )}
      </div>
      {spotifyToken && spotifyUser ? (
        <button
          onClick={e => { e.stopPropagation(); handleSpotifyPlayPause(); }}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: playing ? '#5ecb8c' : '#23272f',
            color: playing ? '#23272f' : '#5ecb8c',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 700,
            boxShadow: '0 1px 4px #0002',
            cursor: 'pointer',
            marginLeft: 10,
            transition: 'background 0.15s, color 0.15s',
          }}
          aria-label={playing ? 'Pause music' : 'Play music'}
        >
          {playing ? '⏸' : '▶️'}
        </button>
      ) : (
        <button
          onClick={e => {
            e.stopPropagation();
            const url = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(SPOTIFY_SCOPES)}`;
            window.open(url, '_self');
          }}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: '#1db954',
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 700,
            boxShadow: '0 1px 4px #0002',
            cursor: 'pointer',
            marginLeft: 10,
            transition: 'background 0.15s, color 0.15s',
          }}
          aria-label="Connect to Spotify"
        >
          <svg width="22" height="22" viewBox="0 0 168 168" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="84" cy="84" r="84" fill="#1db954"/><path d="M120.6 116.1c-2.1 3.5-6.6 4.6-10.1 2.5-27.6-16.9-62.5-20.7-103.5-11.2-4 0.9-8.1-1.6-9-5.6-0.9-4 1.6-8.1 5.6-9 44.7-10.1 82.2-6 112.1 12.6 3.5 2.1 4.6 6.6 2.5 10.1zm14.3-25.6c-2.6 4.2-8.1 5.6-12.3 3-31.7-19.4-80-25.1-117.5-13.6-4.6 1.4-9.5-1.2-10.9-5.8-1.4-4.6 1.2-9.5 5.8-10.9 41.8-12.5 94.1-6.3 129.2 15.1 4.2 2.6 5.6 8.1 3 12.3zm15.2-28.2c-37.1-22.1-98.2-24.2-133.2-13.1-5.2 1.6-10.7-1.3-12.3-6.5-1.6-5.2 1.3-10.7 6.5-12.3 39.2-12.1 105.2-9.7 147.6 14.2 5 3 6.6 9.5 3.6 14.5-3 5-9.5 6.6-14.5 3.6z" fill="#fff"/></svg>
        </button>
      )}
    </div>
  );
}
