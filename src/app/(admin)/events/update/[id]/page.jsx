"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { MultiStepEventForm } from "@/components/events";

export default function UpdateEventPage({ params }) {
  const { id } = params;

  // In a real app, you would fetch the event data by ID
  const eventData = {
    id: id,
    title: "Sample Event",
    description: "Sample description",
    // ... other event data
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Update Event"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Events", href: "/admin/events" },
          { label: "Update Event", href: `/admin/events/update/${id}` }
        ]}
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MultiStepEventForm initialData={eventData} isEdit={true} />
      </div>
    </div>
  );
}
