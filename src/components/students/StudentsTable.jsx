"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/common/DataTable";
import { Badge } from "@/components/ui";
import { getAllStudents, deleteStudent } from "@/lib/api/student";

const StudentsTable = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllStudents();
        
        if (response.success) {
          setStudents(response.data?.students || []);
        } else {
          setError(response.message || "Failed to fetch students");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching students");
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter options based on API data
  const filterOptions = useMemo(() => {
    const branches = Array.from(new Set(students.map((s) => s.branch).filter(Boolean)));
    const ranks = Array.from(new Set(students.map((s) => s.rank).filter(Boolean)));
    return { branches, ranks };
  }, [students]);

  // Calculate stats from API data
  const stats = useMemo(() => {
    // Note: Course enrollment stats will be calculated once enrollment system is implemented
    return [
      {
        label: "Total Students",
        value: students.length,
        icon: "🎓",
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        label: "With Rank",
        value: students.filter((s) => s.rank).length,
        icon: "⭐",
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
      },
      {
        label: "With Branch",
        value: students.filter((s) => s.branch).length,
        icon: "🏢",
        bgColor: "bg-purple-100",
        iconColor: "text-purple-600",
      },
      {
        label: "With Phone",
        value: students.filter((s) => s.phone).length,
        icon: "📞",
        bgColor: "bg-yellow-100",
        iconColor: "text-yellow-600",
      },
    ];
  }, [students]);

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
          <p>{item.phone || "N/A"}</p>
          {item.address && (
            <p className="text-xs text-gray-500">
              {item.address.city || ""}, {item.address.state || ""}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Registered",
      render: (_value, item) => {
        const date = new Date(item.createdAt);
        return (
          <div className="text-sm text-gray-700">
            <p>{date.toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">{date.toLocaleTimeString()}</p>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (_value, item) => {
        // For now, use a simple status based on registration
        // Will be updated once enrollment system is in place
        const status = item.lastLogin ? "Active" : "New";
        const color = status === "Active" ? "info" : "default";
        return <Badge color={color}>{status}</Badge>;
      },
    },
  ];

  const filters = [
    {
      key: "branch",
      label: "Branch / Division",
      options: filterOptions.branches,
    },
    {
      key: "rank",
      label: "Rank",
      options: filterOptions.ranks,
    },
  ];

  const handleAdd = () => {
    router.push("/students/add");
  };

  const handleView = (student) => {
    router.push(`/students/${student._id}`);
  };

  const handleEdit = (student) => {
    router.push(`/students/${student._id}/edit`);
  };

  const handleDelete = async (student) => {
    if (!confirm(`Are you sure you want to delete ${student.fullName}?`)) {
      return;
    }

    try {
      const response = await deleteStudent(student._id);
      if (response.success) {
        // Refresh the list
        setStudents((prev) => prev.filter((s) => s._id !== student._id));
      } else {
        alert(response.message || "Failed to delete student");
      }
    } catch (err) {
      alert(err.message || "An error occurred while deleting the student");
      console.error("Error deleting student:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-800">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-600 underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  // Note: DataTable handles its own search/filter state internally
  // We send API requests on mount and when filters change
  // Client-side filtering in DataTable is a fallback for small datasets
  return (
    <DataTable
      title="Students"
      description="Manage student records, enrollment, and training progress."
      data={students}
      columns={columns}
      filters={filters}
      stats={stats}
      searchPlaceholder="Search students by name, email, rank, or branch..."
      onAdd={handleAdd}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};

export default StudentsTable;

