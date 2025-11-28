"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { EventsTable } from "@/components/events";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Events Management" />
      <EventsTable />
    </div>
  );
}