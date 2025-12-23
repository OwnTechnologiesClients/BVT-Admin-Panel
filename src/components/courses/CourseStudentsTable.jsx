"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import DataTable from "@/components/common/DataTable";
import { Mail, Phone } from "lucide-react";
import * as enrollmentAPI from "@/lib/api/enrollment";
import { showError } from "@/lib/utils/sweetalert";

const CourseStudentsTable = ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const hasInitialFetch = useRef(false);

  // Fetch course students
  const fetchStudents = useCallback(async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await enrollmentAPI.getCourseEnrollments(courseId);
      
      if (response.success) {
        const data = response.data;
        setCourseTitle(data.course?.title || "Course");
        setStudents(data.enrollments || []);
        setTotalStudents(data.enrollments?.length || 0);
      } else {
        setError(response.message || 'Failed to fetch students');
        showError('Error Loading Students', response.message || 'Failed to fetch students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      const errorMsg = err.message || 'Failed to fetch students';
      setError(errorMsg);
      showError('Error Loading Students', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Initial fetch - only run once even in Strict Mode
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "N/A";
    }
  };

  // Format students for display
  const formattedStudents = students.map((enrollment, index) => {
    const student = enrollment.studentId || {};
    return {
      id: student._id || enrollment._id || index,
      number: index + 1,
      name: student.fullName || "N/A",
      email: student.email || "N/A",
      phone: student.phone || "N/A",
      enrolledOn: formatDate(enrollment.enrolledAt),
      status: enrollment.status || "active",
      progress: enrollment.progress || 0
    };
  });

  const columns = [
    {
      key: "number",
      label: "#"
    },
    {
      key: "name",
      label: "Name"
    },
    {
      key: "email",
      label: "Email",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: "phone",
      label: "Phone",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: "progress",
      label: "Progress",
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 min-w-[3rem]">{value}%</span>
        </div>
      )
    },
    {
      key: "enrolledOn",
      label: "Enrolled On"
    }
  ];

  const stats = [
    {
      label: "Total Students",
      value: totalStudents,
      icon: "👥",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    }
  ];

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading students...</p>
      </div>
    );
  }

  if (error && students.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Registered Students"
      description={courseTitle ? `Students enrolled in "${courseTitle}"` : "Course Students"}
      data={formattedStudents}
      columns={columns}
      searchPlaceholder="Search students by name, email, or phone..."
      filters={[]}
      stats={stats}
      pagination={null}
      serverSide={false}
    />
  );
};

export default CourseStudentsTable;

