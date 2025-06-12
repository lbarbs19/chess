import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { sidebarIcons } from './components/SidebarIcons';
import Home from './components/Home';
import Lobby from './components/Lobby';
import MainChessApp from './components/MainChessApp';
import Profile from './components/Profile';
import Settings from './components/Settings';
import { useSidebar } from './hooks/useSidebar';
import './App.css';

function App() {
  const {
    sidebarHovered,
    sidebarLocked,
    handleSidebarAreaEnter,
    handleSidebarAreaLeave,
    handleSidebarTabClick,
  } = useSidebar();

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
        <Sidebar
          icons={sidebarIcons}
          hovered={sidebarHovered}
          locked={sidebarLocked}
          onAreaEnter={handleSidebarAreaEnter}
          onAreaLeave={handleSidebarAreaLeave}
          onTabClick={handleSidebarTabClick}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 1200, margin: '0 auto', padding: '32px 0', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lobby/:code" element={<Lobby />} />
            <Route path="/chess" element={<MainChessApp />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;