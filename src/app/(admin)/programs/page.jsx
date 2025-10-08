import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { ProgramsTable } from "@/components/programs";

export default function ProgramsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="View Programs" />
      <ProgramsTable />
    </div>
  );
}
