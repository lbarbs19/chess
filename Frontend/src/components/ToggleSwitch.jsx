import React from 'react';

export default function ToggleSwitch({ checked, onChange, disabled, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
      <span>{label}</span>
      <span style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          position: 'absolute',
          cursor: disabled ? 'not-allowed' : 'pointer',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: checked ? '#5ecb8c' : '#bbb',
          borderRadius: 24,
          transition: 'background 0.2s',
        }}></span>
        <span style={{
          position: 'absolute',
          left: checked ? 22 : 2,
          top: 2,
          width: 20,
          height: 20,
          background: '#fff',
          borderRadius: '50%',
          boxShadow: '0 1px 4px #0002',
          transition: 'left 0.2s',
        }}></span>
      </span>
    </label>
  );
}
