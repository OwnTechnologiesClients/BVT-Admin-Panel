import React from "react";
import { ComponentCard, PageBreadcrumb } from "@/components/common";

export default function CourseSettingsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Course Settings" />
      <div className="space-y-6">
        <ComponentCard title="Course Settings">
          <div className="text-center py-8 text-gray-500">
            <p>Course-specific settings will be implemented here.</p>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
