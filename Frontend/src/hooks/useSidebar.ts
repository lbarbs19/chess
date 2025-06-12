import { useState } from 'react';

export function useSidebar() {
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarLocked, setSidebarLocked] = useState(false);
  const handleSidebarAreaEnter = () => { if (!sidebarLocked) setSidebarHovered(true); };
  const handleSidebarAreaLeave = () => { if (!sidebarLocked) setSidebarHovered(false); };
  const handleSidebarTabClick = () => setSidebarLocked(locked => !locked);
  return {
    sidebarHovered,
    sidebarLocked,
    handleSidebarAreaEnter,
    handleSidebarAreaLeave,
    handleSidebarTabClick,
  };
}
