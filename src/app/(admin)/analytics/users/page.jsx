import React from "react";
import { ComponentCard, PageBreadcrumb } from "@/components/common";

export default function UserAnalyticsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="User Analytics" />
      <div className="space-y-6">
        <ComponentCard title="User Analytics">
          <div className="text-center py-8 text-gray-500">
            <p>User analytics and reports will be implemented here.</p>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
