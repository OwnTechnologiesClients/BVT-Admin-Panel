"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import InstructorTestsTable from "@/components/instructor/InstructorTestsTable";

export default function InstructorTestsPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle="Assessments"
        homeHref="/instructor"
        homeLabel="Instructor Dashboard"
      />
      <InstructorTestsTable />
    </div>
  );
}

