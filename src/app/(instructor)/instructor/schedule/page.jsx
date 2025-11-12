"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { ComponentCard } from "@/components/common/ComponentCard";

export default function InstructorSchedulePreviewPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle="Upcoming Sessions"
        homeHref="/instructor"
        homeLabel="Instructor Dashboard"
      />
      <ComponentCard title="Schedule Preview">
        <p className="text-sm text-gray-600">
          This area will show your instructor schedule, live calendar sync, and
          quick session management tools. It is currently populated with static
          placeholder content so you can explore navigation without backend data.
        </p>
      </ComponentCard>
    </div>
  );
}

