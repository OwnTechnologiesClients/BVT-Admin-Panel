"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import InstructorCoursesTable from "@/components/instructor/InstructorCoursesTable";

export default function InstructorCoursesPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle="My Courses"
        homeHref="/instructor"
        homeLabel="Instructor Dashboard"
      />
      <InstructorCoursesTable />
    </div>
  );
}

