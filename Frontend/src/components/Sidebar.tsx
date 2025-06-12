import React from 'react';
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

const Sidebar: React.FC<SidebarProps> = ({ icons, hovered, locked, onAreaEnter, onAreaLeave, onTabClick }) => (
  <div
    style={{
      position: 'relative',
      zIndex: 2,
      height: '90vh',
      maxHeight: 800,
      minWidth: 0,
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
        <div style={{
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
          boxShadow: hovered ? '0 4px 16px #5ecb8c44' : '0 2px 8px #0002',
          userSelect: 'none',
          transition: 'box-shadow 0.15s',
        }}>
          <span role="img" aria-label="logo">♛</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, flex: 1, justifyContent: 'center', width: '100%' }}>
        {icons.map((item, idx) => (
          <SidebarButton key={item.label} icon={item.icon} label={item.label} active={idx === 0} />
        ))}
      </div>
      <div style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #b0b8c1 0%, #23272f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        color: '#fff',
        fontWeight: 700,
        boxShadow: hovered ? '0 2px 8px #b0b8c144' : '0 1px 4px #0002',
        userSelect: 'none',
        transition: 'box-shadow 0.15s',
      }}>
        <span role="img" aria-label="avatar">👤</span>
      </div>
      <div
        style={{
          position: 'absolute',
          right: -24,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 24,
          height: 64,
          background: 'rgba(35,39,47,0.98)',
          borderRadius: '0 16px 16px 0',
          boxShadow: '0 2px 8px #0002',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 3,
          borderLeft: '2px solid #23272f',
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

export default Sidebar;
