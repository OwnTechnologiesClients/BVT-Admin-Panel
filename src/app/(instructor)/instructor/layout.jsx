"use client";

import React, { useEffect, useRef } from "react";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function InstructorLayout({ children }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { role, setRole } = useAuth();
  const router = useRouter();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (role !== "instructor") {
        setRole("instructor");
      }
      return;
    }

    if (role !== "instructor") {
      router.push("/");
    }
  }, [role, setRole, router]);

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-7xl md:p-6">{children}</div>
      </div>
    </div>
  );
}

