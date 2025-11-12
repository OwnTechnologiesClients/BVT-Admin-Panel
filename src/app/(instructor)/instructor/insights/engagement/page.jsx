"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { ComponentCard } from "@/components/common/ComponentCard";

export default function InstructorEngagementInsightsPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle="Student Engagement"
        homeHref="/instructor"
        homeLabel="Instructor Dashboard"
        trail={[
          { label: "Insights", href: "/instructor/insights/courses" },
          { label: "Student Engagement" },
        ]}
      />
      <ComponentCard title="Engagement Analytics (Preview)">
        <p className="text-sm text-gray-600">
          Live engagement analytics, participation heatmaps, and feedback
          summaries will surface here once the data pipeline is ready. This
          preview keeps the layout consistent while backend work continues.
        </p>
      </ComponentCard>
    </div>
  );
}

