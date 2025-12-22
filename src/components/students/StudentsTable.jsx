"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import { Search, Filter, Eye, Edit, Trash2, Plus } from "lucide-react";
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

  // Explicit search trigger (type + Enter or button)
  const handleSearch = useCallback(() => {
    // Always reset to first page when searching
    fetchStudents(1, pagination.limit, searchTerm);
  }, [fetchStudents, pagination.limit, searchTerm]);

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
      {
        label: "With Phone",
        value: students.filter((s) => s.phone).length,
        icon: "📞",
        bgColor: "bg-yellow-100",
        iconColor: "text-yellow-600",
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
    router.push(`/students/${student._id}`);
  };

  const handleEdit = (student) => {
    router.push(`/students/${student._id}/edit`);
  };

  const handleDelete = async (student) => {
    const result = await showDeleteConfirm(
      `Delete ${student.fullName}?`,
      'This action cannot be undone. All student data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      const response = await deleteStudent(student._id);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading students...</p>
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
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color || 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-8 h-8 ${stat.bgColor || 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                  <span className={`${stat.iconColor || 'text-blue-600'} font-semibold`}>
                    {stat.icon}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters and Search - Matching MyCourses pattern */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Students</h2>
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Student
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>
        </div>

        {/* Data Table */}
        <div className="p-6">
          {formattedStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {columns.map((column, index) => (
                      <th key={index} className="text-left py-3 px-4 font-medium text-gray-700">
                        {column.label}
                      </th>
                    ))}
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formattedStudents.map((item, index) => (
                    <tr key={item._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                      {columns.map((column, colIndex) => (
                        <td key={colIndex} className="py-4 px-4">
                          {column.render ? column.render(item[column.key], item) : item[column.key]}
                        </td>
                      ))}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left side: Items info and page size selector */}
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
                    <span className="font-medium">{pagination.total}</span> items
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Show:</label>
                    <select
                      value={pagination.limit}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                {/* Right side: Page navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[2.5rem] px-3 py-1 border rounded-md text-sm ${
                            pageNum === pagination.page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsTable;

