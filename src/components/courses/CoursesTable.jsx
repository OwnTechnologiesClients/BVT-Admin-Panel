"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
import * as courseAPI from "@/lib/api/course";

const CoursesTable = () => {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    avgPrice: 0
  });

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseAPI.getAllCourses({ limit: 100 });
      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Format course data for display
  const formatCourses = (courses) => {
    return courses.map(course => {
      const instructor = course.instructor?.userId || {};
      const instructorName = instructor.firstName && instructor.lastName
        ? `${instructor.firstName} ${instructor.lastName}`
        : instructor.username || 'N/A';
      
      return {
        id: course._id,
        title: course.title,
        instructor: instructorName,
        students: 0, // This would need to come from enrollment data
        status: course.status || 'draft',
        type: course.isOnline ? 'Online' : 'Offline',
        category: course.category?.name || 'N/A',
        duration: course.duration || 'N/A',
        price: `$${course.price || 0}`,
        difficulty: course.level || 'beginner',
        createdAt: course.createdAt
      };
    });
  };

  const formattedCourses = formatCourses(courses);

  const columns = [
    {
      key: "title",
      label: "Course",
      render: (value, item) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{item.duration} • {item.difficulty}</p>
        </div>
      )
    },
    {
      key: "instructor",
      label: "Instructor"
    },
    {
      key: "category",
      label: "Category",
      render: (value) => <Badge color="default">{value}</Badge>
    },
    {
      key: "students",
      label: "Students"
    },
    {
      key: "type",
      label: "Type",
      render: (value) => {
        const colors = {
          "Online": "info",
          "Offline": "default",
          "Hybrid": "warning"
        };
        return <Badge color={colors[value] || "default"}>{value}</Badge>;
      }
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const colors = {
          "active": "success",
          "draft": "warning",
          "inactive": "error"
        };
        const displayValue = value.charAt(0).toUpperCase() + value.slice(1);
        return <Badge color={colors[value] || "default"}>{displayValue}</Badge>;
      }
    },
    {
      key: "price",
      label: "Price",
      render: (value) => <span className="font-medium">{value}</span>
    }
  ];

  const filters = [
    {
      key: "category",
      label: "Categories",
      options: ["Marine Engineering", "Navigation", "Maritime Safety", "Naval Operations", "Submarine Operations"]
    },
    {
      key: "status",
      label: "Status",
      options: ["active", "draft", "inactive"]
    },
    {
      key: "type",
      label: "Type",
      options: ["Online", "Offline", "Hybrid"]
    }
  ];

  const computedStats = [
    {
      label: "Total Courses",
      value: formattedCourses.length,
      icon: "C",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Active Courses",
      value: formattedCourses.filter(c => c.status === "active").length,
      icon: "✓",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      color: "text-green-600"
    },
    {
      label: "Total Students",
      value: formattedCourses.reduce((sum, course) => sum + course.students, 0),
      icon: "👥",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      label: "Avg. Price",
      value: formattedCourses.length > 0
        ? `$${Math.round(formattedCourses.reduce((sum, course) => sum + parseInt(course.price.replace('$', '') || 0), 0) / formattedCourses.length)}`
        : "$0",
      icon: "$",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
    }
  ];

  const handleAdd = () => {
    router.push("/courses/add");
  };

  const handleEdit = (course) => {
    router.push(`/courses/update/${course.id}`);
  };

  const handleDelete = async (course) => {
    if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
      try {
        const response = await courseAPI.deleteCourse(course.id);
        if (response.success) {
          await fetchCourses();
        }
      } catch (err) {
        alert(err.message || 'Failed to delete course');
      }
    }
  };

  const handleView = (course) => {
    router.push(`/courses/details/${course.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Courses Management"
      description="Manage and monitor all training courses"
      data={formattedCourses}
      columns={columns}
      filters={filters}
      stats={computedStats}
      searchPlaceholder="Search courses by title or instructor..."
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
    />
  );
};

export default CoursesTable;
