"use client";

import React from "react";
import { useSidebar } from "@/context/SidebarContext";

const Backdrop = () => {
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      onClick={() => setIsMobileOpen(false)}
    />
  );
};

export default Backdrop;
