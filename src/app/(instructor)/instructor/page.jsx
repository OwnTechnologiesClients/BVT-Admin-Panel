"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import InstructorDashboard from "@/components/instructor/InstructorDashboard";

export default function InstructorDashboardPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle="Instructor Dashboard"
        homeHref="/instructor"
        homeLabel="Instructor Dashboard"
      />
      <InstructorDashboard />
    </div>
  );
}

