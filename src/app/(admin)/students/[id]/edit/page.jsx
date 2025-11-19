"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { StudentForm } from "@/components/students";
import { getStudentById } from "@/lib/api/student";

const EditStudentPage = () => {
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
          const studentData = response.data?.student;
          // Transform student data to match form structure
          const formData = {
            fullName: studentData.fullName || "",
            email: studentData.email || "",
            password: "", // Don't pre-fill password
            confirmPassword: "", // Don't pre-fill password
            phone: studentData.phone || "",
            age: studentData.age?.toString() || "",
            gender: studentData.gender || "",
            rank: studentData.rank || "",
            branch: studentData.branch || "",
            dob: studentData.dob ? new Date(studentData.dob).toISOString().split('T')[0] : "",
            street: studentData.address?.street || "",
            city: studentData.address?.city || "",
            state: studentData.address?.state || "",
            postalCode: studentData.address?.postalCode || "",
            country: studentData.address?.country || "",
            emergencyName: studentData.emergencyContact?.name || "",
            emergencyRelation: studentData.emergencyContact?.relation || "",
            emergencyPhone: studentData.emergencyContact?.phone || "",
            notes: studentData.notes || "",
          };
          setStudent({ ...studentData, formData });
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

  const handleSuccess = (updatedStudent) => {
    router.push(`/students/${studentId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb
          pageTitle="Loading..."
          trail={[
            { label: "Students", href: "/students" },
            { label: "Edit", href: `/students/${studentId}/edit` },
            { label: "Loading" },
          ]}
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
          trail={[
            { label: "Students", href: "/students" },
            { label: "Edit", href: `/students/${studentId}/edit` },
            { label: "Not Found" },
          ]}
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
        pageTitle={`Edit Student: ${student.fullName}`}
        trail={[
          { label: "Students", href: "/students" },
          { label: student.fullName, href: `/students/${studentId}` },
          { label: "Edit" },
        ]}
      />
      <StudentForm 
        studentId={studentId}
        initialData={student.formData}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default EditStudentPage;

