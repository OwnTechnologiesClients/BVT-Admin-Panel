import React from "react";
import { ComponentCard, PageBreadcrumb } from "@/components/common";

export default function RevenueAnalyticsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Revenue Analytics" />
      <div className="space-y-6">
        <ComponentCard title="Revenue Analytics">
          <div className="text-center py-8 text-gray-500">
            <p>Revenue analytics and reports will be implemented here.</p>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
