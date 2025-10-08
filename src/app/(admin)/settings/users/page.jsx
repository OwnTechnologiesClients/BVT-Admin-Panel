import React from "react";
import { ComponentCard, PageBreadcrumb } from "@/components/common";

export default function UserSettingsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="User Settings" />
      <div className="space-y-6">
        <ComponentCard title="User Settings">
          <div className="text-center py-8 text-gray-500">
            <p>User-specific settings will be implemented here.</p>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
