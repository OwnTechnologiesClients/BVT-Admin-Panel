"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { MultiStepCourseForm } from "@/components/courses";

export default function UpdateCoursePage({ params }) {
  const { id } = params;

  // In a real app, you would fetch the course data by ID
  const courseData = {
    id: id,
    title: "Sample Course",
    description: "Sample description",
    // ... other course data
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Update Course"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Courses", href: "/admin/courses" },
          { label: "Update Course", href: `/admin/courses/update/${id}` }
        ]}
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <MultiStepCourseForm initialData={courseData} isEdit={true} />
      </div>
    </div>
  );
}
