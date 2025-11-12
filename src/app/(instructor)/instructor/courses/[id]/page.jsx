"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import InstructorCourseDetail from "@/components/instructor/InstructorCourseDetail";
import {
  instructorCourses,
  courseDetailById,
} from "@/data/instructorMockData";

export default function InstructorCourseDetailPage({ params }) {
  const { id } = params;
  const course = instructorCourses.find((item) => item.id === id);
  const detail = courseDetailById[id];

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle={course ? course.title : "Course Not Found"}
        homeHref="/instructor"
        homeLabel="Instructor Dashboard"
        trail={[
          { label: "My Courses", href: "/instructor/courses" },
          { label: course ? course.code : "Preview" },
        ]}
      />
      <InstructorCourseDetail course={course} detail={detail} />
    </div>
  );
}

