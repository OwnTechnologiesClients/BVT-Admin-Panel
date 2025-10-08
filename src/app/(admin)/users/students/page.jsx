import React from "react";
import { ComponentCard, PageBreadcrumb } from "@/components/common";

export default function StudentsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Students" />
      <div className="space-y-6">
        <ComponentCard title="Students List">
          <div className="text-center py-8 text-gray-500">
            <p>Student management functionality will be implemented here.</p>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
