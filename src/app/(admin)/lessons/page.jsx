"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import LessonsTable from "@/components/lessons/LessonsTable";

export default function LessonsPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Lessons Management"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Lessons", href: "/lessons" }
        ]}
      />
      <LessonsTable />
    </div>
  );
}
