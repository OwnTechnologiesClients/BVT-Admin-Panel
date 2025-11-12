"use client";

import React from "react";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";

const CoursesTable = () => {
  const courses = [
    {
      id: 1,
      title: "Advanced Naval Engineering Workshop",
      instructor: "Commander James Rodriguez",
      students: 15,
      status: "Active",
      type: "Offline",
      category: "Marine Engineering",
      duration: "5 days",
      price: "$2,500",
      difficulty: "Advanced",
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Maritime Security Operations",
      instructor: "Captain Michael Thompson",
      students: 12,
      status: "Active",
      type: "Offline",
      category: "Maritime Safety",
      duration: "3 days",
      price: "$1,800",
      difficulty: "Intermediate",
      createdAt: "2024-01-20"
    },
    {
      id: 3,
      title: "Submarine Operations Masterclass",
      instructor: "Commander Lisa Chen",
      students: 8,
      status: "Active",
      type: "Offline",
      category: "Submarine Operations",
      duration: "7 days",
      price: "$3,200",
      difficulty: "Advanced",
      createdAt: "2024-01-25"
    },
    {
      id: 4,
      title: "Marine Engineering Fundamentals",
      instructor: "Commander Sarah Johnson",
      students: 150,
      status: "Active",
      type: "Online",
      category: "Marine Engineering",
      duration: "8 weeks",
      price: "$800",
      difficulty: "Beginner",
      createdAt: "2024-02-01"
    },
    {
      id: 5,
      title: "Naval Architecture Principles",
      instructor: "Captain David Wilson",
      students: 25,
      status: "Draft",
      type: "Online",
      category: "Marine Engineering",
      duration: "6 weeks",
      price: "$1,200",
      difficulty: "Intermediate",
      createdAt: "2024-02-05"
    },
    {
      id: 6,
      title: "Navigation Systems & GPS",
      instructor: "Lieutenant Commander Alex Brown",
      students: 45,
      status: "Active",
      type: "Hybrid",
      category: "Navigation",
      duration: "4 weeks",
      price: "$1,500",
      difficulty: "Intermediate",
      createdAt: "2024-02-10"
    }
  ];

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
          "Active": "success",
          "Draft": "warning",
          "Inactive": "error"
        };
        return <Badge color={colors[value] || "default"}>{value}</Badge>;
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
      options: ["Active", "Draft", "Inactive"]
    },
    {
      key: "type",
      label: "Type",
      options: ["Online", "Offline", "Hybrid"]
    }
  ];

  const stats = [
    {
      label: "Total Courses",
      value: courses.length,
      icon: "C",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Active Courses",
      value: courses.filter(c => c.status === "Active").length,
      icon: "✓",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      color: "text-green-600"
    },
    {
      label: "Total Students",
      value: courses.reduce((sum, course) => sum + course.students, 0),
      icon: "👥",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      label: "Avg. Price",
      value: `$${Math.round(courses.reduce((sum, course) => sum + parseInt(course.price.replace('$', '')), 0) / courses.length)}`,
      icon: "$",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
    }
  ];

  const handleAdd = () => {
    window.location.href = "/admin/courses/add";
  };

  const handleEdit = (course) => {
    window.location.href = `/admin/courses/update/${course.id}`;
  };

  const handleDelete = (course) => {
    if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
      console.log("Delete course:", course);
    }
  };

  const handleView = (course) => {
    window.location.href = `/admin/courses/details/${course.id}`;
  };

  return (
    <DataTable
      title="Courses Management"
      description="Manage and monitor all training courses"
      data={courses}
      columns={columns}
      filters={filters}
      stats={stats}
      searchPlaceholder="Search courses by title or instructor..."
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
    />
  );
};

export default CoursesTable;