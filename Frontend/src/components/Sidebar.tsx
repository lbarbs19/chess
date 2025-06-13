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
  return (    <div
      style={{
        position: 'fixed', // Ensures sidebar is always fixed
        top: 0,
        left: 0,
        zIndex: 200,
        height: '100%',
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
    >      <div
        style={{
          position: 'absolute',
          left: (hovered || locked) ? 0 : -90,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 100,
          height: 'auto', // Let content determine height
          maxHeight: '80vh', // Prevent overflow on small screens
          background: 'rgba(35,39,47,0.3)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 22,
          margin: 0,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '64px 0 64px 0',
          transition: 'left 180ms cubic-bezier(.77,0,.18,1), transform 180ms cubic-bezier(.77,0,.18,1)',          overflow: 'visible',
          //willChange: 'left',
        }}
      >
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
