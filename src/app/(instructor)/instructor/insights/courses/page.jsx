"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { ComponentCard } from "@/components/common/ComponentCard";

export default function InstructorCourseInsightsPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle="Course Performance"
        homeHref="/instructor"
        homeLabel="Instructor Dashboard"
        trail={[
          { label: "Insights", href: "/instructor/insights/courses" },
          { label: "Course Performance" },
        ]}
      />
      <ComponentCard title="Performance Insights (Preview)">
        <p className="text-sm text-gray-600">
          Dashboard widgets for completion rates, assessment trends, and course
          health scores will appear here once analytics APIs are wired in.
        </p>
      </ComponentCard>
    </div>
  );
}

