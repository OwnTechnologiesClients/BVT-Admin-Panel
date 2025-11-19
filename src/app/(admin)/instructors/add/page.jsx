"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { MultiStepMentorForm } from "@/components/instructors";

export default function AddUserPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Add New Instructor"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Instructors", href: "/instructors" },
          { label: "Add Instructor", href: "/instructors/add" }
        ]}
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MultiStepMentorForm />
      </div>
    </div>
  );
}