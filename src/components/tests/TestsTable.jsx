"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import { Search, Filter, Eye, Edit, Trash2, Plus } from "lucide-react";
import * as testAPI from "@/lib/api/test";
import * as courseAPI from "@/lib/api/course";

const TestsTable = () => {
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch tests with server-side pagination (Oasis pattern)
  const fetchTests = useCallback(async (page, limit, search, courseId, isActive) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        sort_column: 'createdAt',
        sort_direction: 'desc',
        ...(search && { search }),
        ...(courseId && { courseId }),
        ...(isActive !== undefined && { isActive })
      };

      const response = await testAPI.getAllTests(params);
      if (response.success) {
        setTests(response.data || []);
        if (response.pagination) {
          setPagination({
            page: response.pagination.page || page,
            limit: response.pagination.limit || limit,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0
          });
        }
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError(err.message || 'Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch courses for filter
  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses({ limit: 100 });
      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTests(1, 10, "", "", undefined);
    fetchCourses();
  }, [fetchTests]);

  // Debounced search (300ms like Oasis)
  const searchTimeoutRef = useRef(null);
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      const isActive = statusFilter === "Active" ? true : statusFilter === "Inactive" ? false : undefined;
      const courseId = courseFilter || "";
      fetchTests(1, pagination.limit, searchTerm, courseId, isActive);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchTests, pagination.limit, courseFilter, statusFilter]);

  // Handle filter changes - trigger API call
  useEffect(() => {
    const isActive = statusFilter === "Active" ? true : statusFilter === "Inactive" ? false : undefined;
    const courseId = courseFilter || "";
    fetchTests(1, pagination.limit, searchTerm, courseId, isActive);
  }, [courseFilter, statusFilter, fetchTests, pagination.limit, searchTerm]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    const isActive = statusFilter === "Active" ? true : statusFilter === "Inactive" ? false : undefined;
    const courseId = courseFilter || "";
    fetchTests(newPage, pagination.limit, searchTerm, courseId, isActive);
  }, [fetchTests, pagination.limit, searchTerm, courseFilter, statusFilter]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    const isActive = statusFilter === "Active" ? true : statusFilter === "Inactive" ? false : undefined;
    const courseId = courseFilter || "";
    fetchTests(1, newPageSize, searchTerm, courseId, isActive);
  }, [fetchTests, searchTerm, courseFilter, statusFilter]);

  // Format test data
  const formatTest = (test) => {
    const course = test.courseId || {};
    const courseName = course.title || 'N/A';
    
    return {
      id: test._id,
      title: test.title,
      course: courseName,
      courseId: course._id || course.id,
      duration: test.duration || 0,
      passingScore: test.passingScore || 0,
      totalQuestions: test.questions?.length || 0,
      totalStudents: 0, // This would need to come from enrollments
      completed: 0, // This would need to come from test results
      pending: 0, // This would need to come from test results
      averageScore: 0, // This would need to come from test results
      isActive: test.isActive !== undefined ? test.isActive : true,
      createdAt: test.createdAt
    };
  };

  // Format tests for display
  const formattedTests = tests.map(formatTest);

  const columns = [
    {
      key: "title",
      label: "Test Name",
      render: (value, item) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          {item.createdAt && (
            <p className="text-xs text-gray-500">
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )
    },
    {
      key: "course",
      label: "Course"
    },
    {
      key: "duration",
      label: "Duration",
      render: (value) => <span>{value} min</span>
    },
    {
      key: "totalQuestions",
      label: "Questions"
    },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <Badge color={value ? "success" : "default"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      )
    }
  ];

  // Get unique courses from current tests (for filter dropdown)
  const uniqueCourses = Array.from(
    new Set(formattedTests.map(t => t.course).filter(Boolean))
  ).sort();

  const stats = [
    {
      label: "Total Tests",
      value: pagination.total || tests.length,
      icon: "📝",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Active Tests",
      value: formattedTests.filter(t => t.isActive).length,
      icon: "✓",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      label: "Total Questions",
      value: formattedTests.reduce((sum, t) => sum + t.totalQuestions, 0),
      icon: "❓",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      label: "Total Students",
      value: formattedTests.reduce((sum, t) => sum + t.totalStudents, 0),
      icon: "👥",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
    }
  ];

  const handleAdd = () => {
    router.push("/tests/add");
  };

  const handleEdit = (test) => {
    router.push(`/tests/update/${test.id}`);
  };

  const handleDelete = async (test) => {
    if (!confirm(`Are you sure you want to delete "${test.title}"?`)) {
      return;
    }

    try {
      const response = await testAPI.deleteTest(test.id);
      if (response.success) {
        // Refresh current page
        const isActive = statusFilter === "Active" ? true : statusFilter === "Inactive" ? false : undefined;
        const courseId = courseFilter || "";
        await fetchTests(pagination.page, pagination.limit, searchTerm, courseId, isActive);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete test');
    }
  };

  const handleView = (test) => {
    router.push(`/tests/${test.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading tests...</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Tests</h2>
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Test
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tests by title or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Course Filter */}
            {uniqueCourses.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

          </div>
        </div>

        {/* Data Table */}
        <div className="p-6">
          {formattedTests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No tests found</p>
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
                  {formattedTests.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-gray-100 hover:bg-gray-50">
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

export default TestsTable;
