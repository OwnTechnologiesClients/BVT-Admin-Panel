import React from "react";
import { ComponentCard, PageBreadcrumb } from "@/components/common";

export default function InstructorSettingsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Instructor Settings" />
      <div className="space-y-6">
        <ComponentCard title="Instructor Settings">
          <div className="text-center py-8 text-gray-500">
            <p>Instructor-specific settings will be implemented here.</p>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}









