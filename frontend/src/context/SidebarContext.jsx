/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useState } from 'react';

const SidebarContext = createContext(undefined);

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(() => {
    return {
      isOpen,
      openSidebar: () => setIsOpen(true),
      closeSidebar: () => setIsOpen(false),
      toggleSidebar: () => setIsOpen((prev) => !prev),
    };
  }, [isOpen]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within a SidebarProvider');
  return ctx;
}
