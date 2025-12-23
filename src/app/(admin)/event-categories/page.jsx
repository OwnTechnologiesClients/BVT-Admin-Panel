"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import EventCategoriesTable from "@/components/event-categories/EventCategoriesTable";

export default function EventCategoriesPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Event Themes"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Event Themes", href: "/event-categories" }
        ]}
      />
      <EventCategoriesTable />
    </div>
  );
}

