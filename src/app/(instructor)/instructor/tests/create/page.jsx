"use client";

import React from "react";
import { PageBreadcrumb, ComponentCard } from "@/components/common";
import { MultiStepTestForm } from "@/components/tests";
import { AlertCircle } from "lucide-react";

export default function InstructorCreateTestPreviewPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle="Create Assessment"
        homeHref="/instructor"
        homeLabel="Instructor Dashboard"
        trail={[
          { label: "Assessments", href: "/instructor/tests" },
          { label: "Create" },
        ]}
      />
      <ComponentCard title="Assessment Builder">
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            This is the same multi-step test builder used in the admin panel.
            Submitting the form won’t call any backend services yet—it’s here so
            instructors can preview the workflow.
          </p>
        </div>
        <MultiStepTestForm />
      </ComponentCard>
    </div>
  );
}