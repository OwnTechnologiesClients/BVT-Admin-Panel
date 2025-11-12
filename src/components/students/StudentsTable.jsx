"use client";

import React from "react";
import DataTable from "@/components/common/DataTable";
import { Badge } from "@/components/ui";
import { studentsMockData } from "@/data/studentsMockData";

const StudentsTable = () => {
  const columns = [
    {
      key: "fullName",
      label: "Student",
      render: (value, item) => (
        <div>
          <p className="font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      ),
    },
    {
      key: "rank",
      label: "Rank / Branch",
      render: (_value, item) => (
        <div className="text-sm text-gray-700">
          <p>{item.rank}</p>
          <p className="text-xs text-gray-500">{item.branch}</p>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Contact",
      render: (_value, item) => (
        <div className="text-sm text-gray-700">
          <p>{item.phone}</p>
          <p className="text-xs text-gray-500">
            {item.address.city}, {item.address.state}
          </p>
        </div>
      ),
    },
    {
      key: "courses",
      label: "Courses",
      render: (_value, item) => (
        <div className="flex flex-wrap gap-2">
          {item.courses.slice(0, 2).map((course) => (
            <Badge key={course.id} color="info">
              {course.title}
            </Badge>
          ))}
          {item.courses.length === 0 && (
            <span className="text-xs text-gray-400">No courses</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_value, item) => {
        const overall = item.courses.some((course) => course.status === "In Progress")
          ? "Active"
          : item.courses.some((course) => course.status === "Completed")
          ? "Completed"
          : "New";

        const color =
          overall === "Active"
            ? "info"
            : overall === "Completed"
            ? "success"
            : "default";

        return <Badge color={color}>{overall}</Badge>;
      },
    },
  ];

  const filters = [
    {
      key: "branch",
      label: "Division",
      options: Array.from(new Set(studentsMockData.map((student) => student.branch))),
    },
    {
      key: "status",
      label: "Status",
      options: ["New", "Active", "Completed"],
    },
  ];

  const stats = [
    {
      label: "Total Students",
      value: studentsMockData.length,
      icon: "🎓",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Courses",
      value: studentsMockData.filter((student) =>
        student.courses.some((course) => course.status === "In Progress")
      ).length,
      icon: "📚",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Completed Programs",
      value: studentsMockData.filter((student) =>
        student.courses.every((course) => course.status === "Completed")
      ).length,
      icon: "🏅",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Without Courses",
      value: studentsMockData.filter((student) => student.courses.length === 0).length,
      icon: "📝",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  ];

  const handleAdd = () => {
    window.location.href = "/students/add";
  };

  const handleView = (student) => {
    window.location.href = `/students/${student.id}`;
  };

  return (
    <DataTable
      title="Students"
      description="Manage student records, enrollment, and training progress."
      data={studentsMockData}
      columns={columns}
      filters={filters}
      stats={stats}
      searchPlaceholder="Search students by name, email, or division..."
      onAdd={handleAdd}
      onView={handleView}
    />
  );
};

export default StudentsTable;

