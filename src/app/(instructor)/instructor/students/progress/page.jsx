"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { ComponentCard } from "@/components/common/ComponentCard";

export default function InstructorStudentProgressPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle="Progress Reports"
        homeHref="/instructor"
        homeLabel="Instructor Dashboard"
        trail={[{ label: "Student Roster", href: "/instructor/students" }, { label: "Progress Reports" }]}
      />
      <ComponentCard title="Progress Analytics Preview">
        <p className="text-sm text-gray-600">
          This section will display individual student progress analytics,
          milestone tracking, and downloadable reports. It is currently a
          placeholder until backend logic is implemented.
        </p>
      </ComponentCard>
    </div>
  );
}

