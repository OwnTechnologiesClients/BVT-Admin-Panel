"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { MultiStepProgramForm } from "@/components/programs";

export default function UpdateProgramPage({ params }) {
  const { id } = params;

  // In a real app, you would fetch the program data by ID
  const programData = {
    id: id,
    title: "Sample Program",
    description: "Sample description",
    // ... other program data
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Update Program"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Programs", href: "/admin/programs" },
          { label: "Update Program", href: `/admin/programs/update/${id}` }
        ]}
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MultiStepProgramForm initialData={programData} isEdit={true} />
      </div>
    </div>
  );
}
