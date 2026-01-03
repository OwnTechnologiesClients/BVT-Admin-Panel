"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { StudentDetail } from "@/components/students";
import { getStudentById } from "@/lib/api/student";

const StudentDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id;
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await getStudentById(studentId);
        
        if (response.success) {
          setStudent(response.data?.student || null);
        } else {
          setError(response.message || "Failed to fetch student");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching student");
        console.error("Error fetching student:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb
          pageTitle="Loading..."
          trail={[{ label: "Students", href: "/students" }, { label: "Loading" }]}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600">Loading student details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb
          pageTitle="Student Not Found"
          trail={[{ label: "Students", href: "/students" }, { label: "Not Found" }]}
        />
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-gray-600">
          {error || "Unable to locate the student record."}{" "}
          <button
            onClick={() => router.back()}
            className="text-blue-600 underline hover:text-blue-800"
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

