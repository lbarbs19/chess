import React from "react";

const Profile: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      color: '#f3f3f3',
      background: 'linear-gradient(135deg, #23272f 0%, #2d3340 100%)',
    }}>
      <div style={{
        background: 'rgba(35,39,47,0.96)',
        borderRadius: 24,
        boxShadow: '0 8px 32px #0006',
        padding: '2.5rem 2.5rem',
        minWidth: 320,
        maxWidth: 420,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
      }}>
        <img src="/Icons/Profile.png" alt="Profile" style={{ width: 72, height: 72, borderRadius: '50%', marginBottom: 12, boxShadow: '0 2px 12px #5ecb8c33' }} />
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: 1, margin: 0, color: '#5ecb8c', textShadow: '0 2px 12px #23272f' }}>Profile</h1>
        <p style={{ fontSize: '1.15rem', color: '#b0b8c1', margin: 0, textAlign: 'center', maxWidth: 320 }}>
          This is a placeholder profile page. Add your user info and settings here!
        </p>
      </div>
    </div>
  );
};

export default Profile;
