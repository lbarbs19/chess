import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SidebarButton from './SidebarButton';

export interface SidebarIcon {
  icon: string;
  label: string;
}

interface SidebarProps {
  icons: SidebarIcon[];
  hovered: boolean;
  locked: boolean;
  onAreaEnter: () => void;
  onAreaLeave: () => void;
  onTabClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ icons, hovered, locked, onAreaEnter, onAreaLeave, onTabClick }) => {
  const location = useLocation();
  return (
    <div
      style={{
        position: 'fixed', // Ensures sidebar is always fixed
        top: 0,
        left: 0,
        zIndex: 200,
        height: '100vh',
        width: 80, // or your sidebar width
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between', // Distribute icons from top to bottom
        transition: 'left 180ms cubic-bezier(.77,0,.18,1)',
        cursor: 'pointer',
        overflow: 'visible',
        willChange: 'left',
      }}
      onMouseEnter={onAreaEnter}
      onMouseLeave={onAreaLeave}
      onFocus={onAreaEnter}
      onBlur={onAreaLeave}
      tabIndex={-1}
    >
      <div
        style={{
          position: 'absolute',
          left: (hovered || locked) ? 0 : -64,
          top: 0,
          width: 80,
          minWidth: 80,
          height: '100%',
          background: 'rgba(35,39,47,0.98)',
          borderRadius: 22,
          margin: '0 24px 0 0',
          boxShadow: '0 4px 24px #0004',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 0 18px 0',
          transition: 'left 180ms cubic-bezier(.77,0,.18,1)',
          cursor: 'pointer',
          overflow: 'visible',
          willChange: 'left',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          {/* Modernized profile image with circular gradient background and hover effects */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #5ecb8c 0%, #2d3340 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 900,
              color: '#fff',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              marginBottom: 8,
            }}
          >
            <img src="/Icons/R.jpg" alt="logo" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          width: '100%',
          flexGrow: 1,
        }}>
          {/* Render all sidebar icons here, with even spacing */}
          {icons.map((item, idx) => {
            if (item.label === 'Home') {
              return (
                <Link
                  to="/"
                  key={item.label}
                  style={{ textDecoration: 'none' }}
                >
                  <SidebarButton icon={item.icon} label={item.label} active={location.pathname === '/'} />
                </Link>
              );
            } else if (item.label === 'Analysis') {
              return (
                <Link
                  to="/chess"
                  key={item.label}
                  style={{ textDecoration: 'none' }}
                >
                  <SidebarButton icon={item.icon} label={item.label} active={location.pathname === '/chess'} />
                </Link>
              );
            } else if (item.label === 'Profile') {
              return (
                <Link
                  to="/profile"
                  key={item.label}
                  style={{ textDecoration: 'none' }}
                >
                  <SidebarButton icon={item.icon} label={item.label} active={location.pathname === '/profile'} />
                </Link>
              );
            } else if (item.label === 'Settings') {
              return (
                <Link
                  to="/settings"
                  key={item.label}
                  style={{ textDecoration: 'none' }}
                >
                  <SidebarButton icon={item.icon} label={item.label} active={location.pathname === '/settings'} />
                </Link>
              );
            } else {
              return (
                <SidebarButton key={item.label} icon={item.icon} label={item.label} active={false} />
              );
            }
          })}
        </div>
        <div
          style={{
            position: 'absolute',
            right: -24,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 24,
            height: 64,
            borderRadius: '0 16px 16px 0',
            boxShadow: '0 2px 8px #0002',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 3,
            borderLeft: '2px solidrgb(38, 47, 35)',
            transition: 'background 0.12s',
            outline: 'none',
          }}
          tabIndex={0}
          aria-label={locked ? 'Unlock sidebar' : 'Lock sidebar'}
          onMouseEnter={onAreaEnter}
          onFocus={onAreaEnter}
          onBlur={onAreaLeave}
          onClick={onTabClick}
        >
          <span style={{
            color: '#5ecb8c',
            fontSize: 22,
            fontWeight: 700,
            userSelect: 'none',
            transform: locked ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.12s, color 0.12s',
          }}>❯</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
