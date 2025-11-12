"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { MultiStepProgramForm } from "@/components/programs";

export default function AddProgramPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Add New Program"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Programs", href: "/admin/programs" },
          { label: "Add Program", href: "/admin/programs/add" }
        ]}
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MultiStepProgramForm />
      </div>
    </div>
  );
}