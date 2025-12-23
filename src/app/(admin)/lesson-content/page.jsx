"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import LessonContentTable from "@/components/lesson-content/LessonContentTable";

export default function LessonContentPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Lesson Content Management"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Lesson Content", href: "/lesson-content" }
        ]}
      />
      <LessonContentTable />
    </div>
  );
}
