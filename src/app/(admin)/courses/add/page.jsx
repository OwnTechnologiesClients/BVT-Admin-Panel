import React from "react";
import { ComponentCard, PageBreadcrumb } from "@/components/common";
import { MultiStepCourseForm } from "@/components/courses";

export default function AddCoursePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Course" />
      <div className="space-y-6">
        <ComponentCard title="Create New Course">
          <MultiStepCourseForm />
        </ComponentCard>
      </div>
    </div>
  );
}
