"use client";

import React from "react";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Code2, ExternalLink } from "lucide-react";

export default function AdminLayout({ children }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="flex-1 p-4 mx-auto max-w-7xl md:p-6 w-full">{children}</div>
        
        {/* Built By Footer */}
        <div className="py-3 border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Built with excellence by</span>
              </div>
              <a
                href="https://owntechnologies.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 group hover:scale-105 transition-transform"
              >
                <span className="font-bold text-sm bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-blue-700 transition-all">
                  OwnTechnologies.in
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-600 group-hover:text-blue-500 transition-colors" />
              </a>
              <div className="text-xs text-gray-400 hidden sm:block">
                <span>|</span>
                <span className="ml-1.5">Premium Web Solutions & Digital Innovation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
