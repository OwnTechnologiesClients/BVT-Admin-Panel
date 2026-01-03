"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { StudentCourseProgress } from "@/components/students";
import { getStudentById, getStudentCourseProgress } from "@/lib/api/student";
import { Loader2 } from "lucide-react";

const StudentCourseProgressPage = () => {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id;
  const courseSlug = params.courseId; // This is actually a slug now
  const [student, setStudent] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId || !courseSlug) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch student data
        const studentResponse = await getStudentById(studentId);
        if (!studentResponse.success) {
          setError(studentResponse.message || "Failed to fetch student");
          setLoading(false);
          return;
        }

        const studentData = studentResponse.data?.student;
        setStudent(studentData);

        // Fetch enrollment/course progress data with full structure
        try {
          const enrollmentResponse = await getStudentCourseProgress(studentId, courseSlug);
          if (enrollmentResponse.success) {
            const responseData = enrollmentResponse.data;
            const enrollmentData = responseData.enrollment;
            const courseData = responseData.course;
            const structure = responseData.structure;
            const progress = responseData.progress;

            if (enrollmentData && courseData) {
              // Transform to component format
              const transformedCourse = {
                enrollmentId: enrollmentData._id,
                _id: courseData._id,
                id: courseData._id,
                slug: courseData.slug,
                title: courseData.title,
                category: typeof courseData.category === 'object' 
                  ? courseData.category?.name 
                  : courseData.category || 'General',
                instructor: typeof courseData.instructor === 'object'
                  ? (courseData.instructor?.userId?.firstName && courseData.instructor?.userId?.lastName
                    ? `${courseData.instructor.userId.firstName} ${courseData.instructor.userId.lastName}`
                    : courseData.instructor?.userId?.email || 'TBA')
                  : courseData.instructor || 'TBA',
                enrollmentDate: new Date(enrollmentData.enrolledAt).toISOString().slice(0, 10),
                status: enrollmentData.status === 'active' ? 'In Progress' : enrollmentData.status === 'completed' ? 'Completed' : enrollmentData.status,
                progress: progress.overallProgress || enrollmentData.progress || 0,
                completedAt: enrollmentData.completedAt,
                lastActive: enrollmentData.lastAccessedAt,
                // New structure data
                structure: structure,
                progressDetails: progress,
                nextLesson: progress.nextLesson
              };
              setEnrollment({ 
                course: transformedCourse, 
                enrollment: enrollmentData,
                structure: structure,
                progress: progress
              });
            } else {
              setError("Enrollment not found");
            }
          } else {
            setError(enrollmentResponse.message || "Failed to fetch course progress");
          }
        } catch (err) {
          console.error("Error fetching enrollment:", err);
          setError(err.message || "Failed to fetch course progress");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, courseSlug]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb
          pageTitle="Loading..."
          trail={[
            { label: "Students", href: "/students" },
            { label: "Loading" },
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-sm text-gray-600">Loading course progress...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb
          pageTitle="Error"
          trail={[
            { label: "Students", href: "/students" },
            { label: "Error" },
          ]}
        />
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-gray-600">
          {error || "Unable to locate the requested course or student."}{" "}
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

  if (!enrollment || !enrollment.course) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb
          pageTitle="Course Not Found"
          trail={[
            { label: "Students", href: "/students" },
            { label: student.fullName, href: `/students/${studentId}` },
            { label: "Not Found" },
          ]}
        />
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-gray-600">
          This student is not enrolled in this course.{" "}
          <button
            onClick={() => router.push(`/students/${studentId}`)}
            className="text-blue-600 underline hover:text-blue-800"
          >
            Go back to student
          </button>
          .
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle={`${student.fullName} • ${enrollment.course.title}`}
        trail={[
          { label: "Students", href: "/students" },
          { label: student.fullName, href: `/students/${studentId}` },
          { label: "Course Progress" },
        ]}
      />
      <StudentCourseProgress 
        student={student} 
        course={enrollment.course} 
        enrollment={enrollment.enrollment}
        structure={enrollment.structure}
        progress={enrollment.progress}
      />
    </div>
  );
};

export default StudentCourseProgressPage;

