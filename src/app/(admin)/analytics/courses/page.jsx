import React from "react";
import { ComponentCard, PageBreadcrumb } from "@/components/common";

export default function CourseAnalyticsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Course Analytics" />
      <div className="space-y-6">
        <ComponentCard title="Course Analytics">
          <div className="text-center py-8 text-gray-500">
            <p>Course analytics and reports will be implemented here.</p>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
