"use client";

import React from "react";
import DataTable from "@/components/common/DataTable";
import { Badge } from "@/components/ui";
import { instructorTests, instructorCourses } from "@/data/instructorMockData";

const statusBadge = (status) =>
  status === "Published" ? "success" : status === "Draft" ? "warning" : "default";

const InstructorTestsTable = () => {
  const courseLookup = instructorCourses.reduce((acc, course) => {
    acc[course.id] = course.title;
    return acc;
  }, {});

  const columns = [
    {
      key: "title",
      label: "Assessment",
      render: (_value, test) => (
        <div>
          <p className="font-semibold text-gray-900">{test.title}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {courseLookup[test.courseId] || test.courseTitle}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <Badge color={statusBadge(status)} className="capitalize">
          {status}
        </Badge>
      ),
    },
    {
      key: "scheduledDate",
      label: "Schedule",
      render: (value) =>
        value
          ? new Date(value).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : "Not scheduled",
    },
    {
      key: "averageScore",
      label: "Avg Score",
      render: (value) => <span className="font-medium text-gray-900">{value}%</span>,
    },
    {
      key: "passingScore",
      label: "Passing Score",
      render: (value) => `${value}%`,
    },
    {
      key: "attempts",
      label: "Attempts",
    },
  ];

  const stats = [
    {
      label: "Published",
      value: instructorTests.filter((test) => test.status === "Published").length,
      icon: "✅",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Drafts",
      value: instructorTests.filter((test) => test.status !== "Published").length,
      icon: "📝",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      label: "Avg Attempts",
      value: Math.round(
        instructorTests.reduce((sum, test) => sum + test.attempts, 0) /
          instructorTests.length
      ),
      icon: "🎯",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Next Scheduled",
      value:
        instructorTests.filter((test) => test.scheduledDate).length || "—",
      icon: "📅",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  const handleCreate = () => {
    window.location.href = "/instructor/tests/create";
  };

  const handleView = (test) => {
    window.location.href = `/instructor/tests/${test.id}`;
  };

  const handleEdit = () => {
    alert("Preview mode: Editing is disabled.");
  };

  const handleDelete = () => {
    alert("Preview mode: Deletion is disabled.");
  };

  return (
    <DataTable
      title="Assessments"
      description="Review and manage course assessments. All data shown here is mock-only for UI exploration."
      data={instructorTests}
      columns={columns}
      stats={stats}
      filters={[
        {
          key: "status",
          label: "Status",
          options: ["Published", "Draft"],
        },
        {
          key: "courseTitle",
          label: "Course",
          options: instructorCourses.map((course) => course.title),
        },
      ]}
      searchPlaceholder="Search assessments by name or course..."
      onAdd={handleCreate}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};

export default InstructorTestsTable;

