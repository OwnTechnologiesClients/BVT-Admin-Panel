"use client";

import React, { use } from "react";
import { PageBreadcrumb } from "@/components/common";
import { MultiStepEventForm } from "@/components/events";

export default function UpdateEventPage({ params }) {
  const { id } = use(params);

  const eventData = {
    id: id
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
