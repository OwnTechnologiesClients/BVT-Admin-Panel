"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
import { getAllStudents, deleteStudent } from "@/lib/api/student";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";

const StudentsTable = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const isInitialMount = useRef(true);
  const hasInitialFetch = useRef(false);

  // Fetch students with server-side pagination (Oasis pattern)
  // Supports lightweight search without triggering full table loading state
  const fetchStudents = useCallback(async (page, limit, search, options = {}) => {
    const { skipLoading = false } = options;
    try {
      if (!skipLoading) setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        sort_column: 'createdAt',
        sort_direction: 'desc',
        ...(search && { search })
      };
      
      const response = await getAllStudents(params);
      
      if (response.success) {
        setStudents(response.data?.students || response.data || []);
        if (response.pagination) {
          setPagination({
            page: response.pagination.page || page,
            limit: response.pagination.limit || limit,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0
          });
        }
      } else {
        const errorMsg = response.message || "Failed to fetch students";
        setError(errorMsg);
        showError('Error Loading Students', errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "An error occurred while fetching students";
      setError(errorMsg);
      console.error("Error fetching students:", err);
      showError('Error Loading Students', errorMsg);
    } finally {
      if (!skipLoading) setLoading(false);
    }
  }, []);

  // Initial fetch - only run once even in Strict Mode
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchStudents(1, 10, "");
    // Mark initial mount as complete after a short delay to allow other effects to skip
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search change from DataTable
  const handleSearchChange = useCallback((search) => {
    setSearchTerm(search);
    fetchStudents(1, pagination.limit, search);
  }, [fetchStudents, pagination.limit]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    fetchStudents(newPage, pagination.limit, searchTerm);
  }, [fetchStudents, pagination.limit, searchTerm]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    fetchStudents(1, newPageSize, searchTerm);
  }, [fetchStudents, searchTerm]);

  // Format student data
  const formatStudent = (student) => ({
    _id: student._id,
    fullName: student.fullName || student.name || 'N/A',
    email: student.email || 'N/A',
    phone: student.phone || 'N/A',
    address: student.address || {},
    createdAt: student.createdAt,
    lastLogin: student.lastLogin,
    rawStudent: student // Keep original for filtering
  });

  // Format students for display
  const formattedStudents = students.map(formatStudent);

  // Get unique filter options from current students
  const filterOptions = useMemo(() => {
    return {};
  }, [students]);

  // Calculate stats from current students
  const stats = useMemo(() => {
    return [
      {
        label: "Total Students",
        value: pagination.total || students.length,
        icon: "🎓",
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
      },
    ];
  }, [students, pagination.total]);

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


  const handleAdd = () => {
    router.push("/students/add");
  };

  const handleView = (student) => {
    router.push(`/students/${student.id || student._id}`);
  };

  const handleEdit = (student) => {
    router.push(`/students/${student.id || student._id}/edit`);
  };

  const handleDelete = async (student) => {
    const result = await showDeleteConfirm(
      `Delete ${student.fullName}?`,
      'This action cannot be undone. All student data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      const response = await deleteStudent(student.id || student._id);
      if (response.success) {
          showSuccess('Student Deleted!', `${student.fullName} has been deleted successfully.`);
        // Refresh all students
        await fetchStudents(pagination.page, pagination.limit, searchTerm);
      } else {
          showError('Delete Failed', response.message || "Failed to delete student");
      }
    } catch (err) {
        showError('Error', err.message || "An error occurred while deleting the student");
      console.error("Error deleting student:", err);
      }
    }
  };

  // Format students to use 'id' instead of '_id' for DataTable
  const formattedData = formattedStudents.map(s => ({
    ...s,
    id: s._id
  }));

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
      title="Students"
      data={formattedData}
      columns={columns}
      searchPlaceholder="Search students by name or email..."
      filters={[]}
      stats={stats}
      pagination={pagination}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearchChange={handleSearchChange}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      serverSide={true}
    />
  );
};

export default StudentsTable;

