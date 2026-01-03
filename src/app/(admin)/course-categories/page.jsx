"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import CourseCategoriesTable from "@/components/course-categories/CourseCategoriesTable";

export default function CourseCategoriesPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Course Categories"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Course Categories", href: "/course-categories" }
        ]}
      />
      <CourseCategoriesTable />
    </div>
  );
}
