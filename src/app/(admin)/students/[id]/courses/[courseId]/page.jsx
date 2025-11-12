"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { StudentCourseProgress } from "@/components/students";
import { studentsMockData } from "@/data/studentsMockData";

const StudentCourseProgressPage = () => {
  const params = useParams();
  const router = useRouter();
  const student = studentsMockData.find((item) => item.id === params.id);
  const course = student?.courses.find((c) => c.id === params.courseId);

  if (!student || !course) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb
          pageTitle="Course Progress"
          trail={[
            { label: "Students", href: "/students" },
            student
              ? { label: student.fullName, href: `/students/${student.id}` }
              : { label: "Not Found" },
            { label: "Course Progress" },
          ]}
        />
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-gray-600">
          Unable to locate the requested course.{" "}
          <button
            onClick={() => router.back()}
            className="text-blue-600 underline"
          >
            Go back
          </button>
          .
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle={`${student.fullName} • ${course.title}`}
        trail={[
          { label: "Students", href: "/students" },
          { label: student.fullName, href: `/students/${student.id}` },
          { label: "Course Progress" },
        ]}
      />
      <StudentCourseProgress student={student} course={course} />
    </div>
  );
};

export default StudentCourseProgressPage;

