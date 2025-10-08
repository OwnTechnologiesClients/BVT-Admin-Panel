import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { CoursesTable } from "@/components/courses";

export default function CoursesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="View Courses" />
      <CoursesTable />
    </div>
  );
}
