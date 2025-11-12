"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { StudentDetail } from "@/components/students";
import { studentsMockData } from "@/data/studentsMockData";

const StudentDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id;
  const student = studentsMockData.find((item) => item.id === studentId);

  if (!student) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb
          pageTitle="Student Not Found"
          trail={[{ label: "Students", href: "/students" }, { label: "Not Found" }]}
        />
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-gray-600">
          Unable to locate the student record.{" "}
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
        pageTitle={student.fullName}
        trail={[
          { label: "Students", href: "/students" },
          { label: student.fullName },
        ]}
      />
      <StudentDetail student={student} />
    </div>
  );
};

export default StudentDetailPage;

