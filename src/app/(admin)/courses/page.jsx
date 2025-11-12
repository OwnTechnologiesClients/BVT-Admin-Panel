"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { CoursesTable } from "@/components/courses";

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Courses Management" />
      <CoursesTable />
    </div>
  );
}