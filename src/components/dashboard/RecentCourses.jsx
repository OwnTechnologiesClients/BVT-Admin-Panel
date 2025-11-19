"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui";
import { Eye, Edit, Trash2, Loader2, Plus } from "lucide-react";
import { getAllCourses } from "@/lib/api/course";
import { getAllEnrollments } from "@/lib/api/enrollment";

export const RecentCourses = () => {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentCounts, setEnrollmentCounts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch recent courses (limit to 5 most recent)
        const coursesResponse = await getAllCourses({
          limit: 5,
          sort_column: 'createdAt',
          sort_direction: 'desc'
        });

        if (coursesResponse.success) {
          const coursesList = coursesResponse.data?.courses || coursesResponse.data || [];
          setCourses(coursesList);

          // Fetch enrollments to get student counts per course
          const enrollmentsResponse = await getAllEnrollments();
          if (enrollmentsResponse.success) {
            const enrollments = enrollmentsResponse.data?.enrollments || enrollmentsResponse.data || [];
            
            // Count enrollments per course
            const counts = {};
            enrollments.forEach(enrollment => {
              const courseId = enrollment.courseId?._id?.toString() || enrollment.courseId?.toString();
              if (courseId) {
                counts[courseId] = (counts[courseId] || 0) + 1;
              }
            });
            setEnrollmentCounts(counts);
          }
        } else {
          setError(coursesResponse.message || "Failed to fetch courses");
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.message || "An error occurred while fetching courses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return "Free";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInstructorName = (instructor) => {
    if (!instructor) return "TBA";
    if (typeof instructor === 'string') return instructor;
    if (instructor.userId) {
      const { firstName, lastName } = instructor.userId;
      return firstName && lastName ? `${firstName} ${lastName}` : instructor.userId.email || "TBA";
    }
    return "TBA";
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Courses</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Courses</h3>
          <Button variant="primary" size="sm" onClick={() => router.push('/courses/add')}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Course
          </Button>
        </div>
        <div className="p-6 text-center text-gray-500">
          No courses found. Create your first course to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Courses
        </h3>
        <Button variant="primary" size="sm" onClick={() => router.push('/courses/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Course
        </Button>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Course
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Instructor
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Students
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Price
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const courseId = course._id?.toString() || course.id?.toString();
                const studentCount = enrollmentCounts[courseId] || 0;
                
                return (
                  <tr key={course._id || course.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {course.title}
                        </p>
                        <p className="text-sm text-gray-700">
                          {course.duration || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {getInstructorName(course.instructor)}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {studentCount}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {course.isOnline ? "Online" : "Offline"}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      <Badge color={course.status === 'active' ? 'success' : course.status === 'draft' ? 'warning' : 'default'}>
                        {course.status || 'Draft'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {formatCurrency(course.price)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-gray-700 hover:text-gray-900"
                          onClick={() => router.push(`/courses/details/${course._id || course.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-gray-700 hover:text-gray-900"
                          onClick={() => router.push(`/courses/update/${course._id || course.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
