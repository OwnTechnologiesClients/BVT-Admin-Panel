import React from "react";
import { ComponentCard, PageBreadcrumb } from "@/components/common";

export default function GeneralSettingsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="General Settings" />
      <div className="space-y-6">
        <ComponentCard title="General Settings">
          <div className="text-center py-8 text-gray-500">
            <p>General settings configuration will be implemented here.</p>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
