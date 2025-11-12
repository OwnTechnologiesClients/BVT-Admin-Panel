"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { MultiStepEventForm } from "@/components/events";

export default function AddEventPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Add New Event"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Events", href: "/admin/events" },
          { label: "Add Event", href: "/admin/events/add" }
        ]}
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MultiStepEventForm />
      </div>
    </div>
  );
}