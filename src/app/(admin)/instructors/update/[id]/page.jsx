"use client";

import React, { use } from "react";
import { PageBreadcrumb } from "@/components/common";
import { MultiStepMentorForm } from "@/components/instructors";

export default function UpdateInstructorPage({ params }) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Update Instructor"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Instructors", href: "/instructors" },
          { label: "Update Instructor", href: `/instructors/update/${id}` }
        ]}
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MultiStepMentorForm initialData={{ id }} isEdit={true} />
      </div>
    </div>
  );
}
