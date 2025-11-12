"use client";

import React from "react";
import DataTable from "@/components/common/DataTable";
import { Badge } from "@/components/ui";
import { instructorCourses } from "@/data/instructorMockData";

const statusColorMap = {
  "In Progress": "info",
  Upcoming: "warning",
  Completed: "success",
};

const modalityColorMap = {
  Online: "info",
  Onsite: "default",
  Hybrid: "warning",
};

const InstructorCoursesTable = () => {
  const columns = [
    {
      key: "title",
      label: "Course",
      render: (_value, item) => (
        <div>
          <p className="font-semibold text-gray-900">{item.title}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {item.code}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge color={statusColorMap[value] || "default"}>{value}</Badge>
      ),
    },
    {
      key: "students",
      label: "Students",
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: "progress",
      label: "Progress",
      render: (value) => (
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-gray-500">
            <span>{value}% complete</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "modality",
      label: "Modality",
      render: (value) => (
        <Badge color={modalityColorMap[value] || "default"}>{value}</Badge>
      ),
    },
    {
      key: "startDate",
      label: "Schedule",
      render: (_value, item) => (
        <div className="text-sm text-gray-600">
          <p>
            {new Date(item.startDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(item.endDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-gray-400 capitalize">{item.level}</p>
        </div>
      ),
    },
  ];

  const stats = [
    {
      label: "Total Courses",
      value: instructorCourses.length,
      icon: "📚",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Students",
      value: instructorCourses.reduce((sum, course) => sum + course.students, 0),
      icon: "👥",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "In Progress",
      value: instructorCourses.filter((course) => course.status === "In Progress")
        .length,
      icon: "⏳",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      label: "Upcoming Sessions",
      value: instructorCourses.filter((course) => course.status === "Upcoming")
        .length,
      icon: "🗓️",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  const handleView = (course) => {
    window.location.href = `/instructor/courses/${course.id}`;
  };

  const handleCreate = () => {
    alert(
      "Course creation is disabled in preview mode. Backend integration pending."
    );
  };

  const handleEdit = () => {
    alert("Editing is disabled in preview mode.");
  };

  const handleDelete = () => {
    alert("Deletion is disabled in preview mode.");
  };

  return (
    <DataTable
      title="My Courses"
      description="Preview of the instructor course workspace. Data is mocked for UI exploration."
      data={instructorCourses}
      columns={columns}
      stats={stats}
      filters={[
        {
          key: "status",
          label: "Status",
          options: ["In Progress", "Upcoming", "Completed"],
        },
        {
          key: "modality",
          label: "Modality",
          options: ["Onsite", "Online", "Hybrid"],
        },
      ]}
      searchPlaceholder="Search courses by title or code..."
      onAdd={handleCreate}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
    />
  );
};

export default InstructorCoursesTable;


