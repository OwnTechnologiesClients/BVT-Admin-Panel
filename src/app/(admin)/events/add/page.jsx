import React from "react";
import { ComponentCard, PageBreadcrumb } from "@/components/common";
import { MultiStepEventForm } from "@/components/events";

export default function AddEventPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Event" />
      <div className="space-y-6">
        <ComponentCard title="Create New Event">
          <MultiStepEventForm />
        </ComponentCard>
      </div>
    </div>
  );
}
