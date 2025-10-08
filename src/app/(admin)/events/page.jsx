import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { EventsTable } from "@/components/events";

export default function EventsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="View Events" />
      <EventsTable />
    </div>
  );
}
