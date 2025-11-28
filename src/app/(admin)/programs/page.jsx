"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { ProgramsTable } from "@/components/programs";

export default function ProgramsPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Programs Management" />
      <ProgramsTable />
    </div>
  );
}