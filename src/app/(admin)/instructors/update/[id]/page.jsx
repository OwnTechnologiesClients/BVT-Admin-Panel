"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { MultiStepMentorForm } from "@/components/instructors";

export default function UpdateInstructorPage({ params }) {
  const { id } = params;

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Update Instructor"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Instructors", href: "/admin/instructors" },
          { label: "Update Instructor", href: `/admin/instructors/update/${id}` }
        ]}
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MultiStepMentorForm />
      </div>
    </div>
  );
}
