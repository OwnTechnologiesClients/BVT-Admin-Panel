import React from "react";
import { ComponentCard, PageBreadcrumb } from "@/components/common";

export default function InstructorsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Instructors" />
      <div className="space-y-6">
        <ComponentCard title="Instructors List">
          <div className="text-center py-8 text-gray-500">
            <p>Instructor management functionality will be implemented here.</p>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
