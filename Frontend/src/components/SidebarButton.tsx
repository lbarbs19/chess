import React from 'react';

interface SidebarButtonProps {
  icon: string | React.ReactNode;
  label: string;
  active: boolean;
}

export default function SidebarButton({ icon, label, active }: SidebarButtonProps) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      tabIndex={0}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: active ? 1 : 0.7,
        cursor: 'pointer',
        fontSize: 26,
        color: hovered || active ? '#5ecb8c' : '#eaeaea',
        userSelect: 'none',
        outline: 'none',
        transform: hovered ? 'scale(1.13)' : 'scale(1)',
        boxShadow: hovered ? '0 2px 16px #5ecb8c33' : 'none',
        background: hovered ? 'rgba(94,203,140,0.08)' : 'transparent',
        borderRadius: 12,
        padding: '4px 0',
        transition: 'color 0.13s, transform 0.13s, box-shadow 0.13s, background 0.13s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={label}
    >
      <span>
        {typeof icon === 'string' && icon.match(/\.(png|jpg|jpeg|svg)$/i) ? (
          <img src={icon} alt={label} style={{ width: 28, height: 28, objectFit: 'contain', display: 'block' }} />
        ) : (
          icon
        )}
      </span>
      <span style={{ fontSize: 10, marginTop: 2, letterSpacing: 0.5 }}>{label}</span>
    </div>
  );
}
