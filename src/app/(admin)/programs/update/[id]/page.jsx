"use client";

import React, { use } from "react";
import { PageBreadcrumb } from "@/components/common";
import { MultiStepProgramForm } from "@/components/programs";

export default function UpdateProgramPage({ params }) {
  const { id } = use(params);

  const programData = {
    id: id
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
