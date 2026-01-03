"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
import * as testAPI from "@/lib/api/test";
import * as courseAPI from "@/lib/api/course";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";

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
  const isInitialMount = useRef(true);
  const hasInitialFetch = useRef(false);

  // Fetch tests with server-side pagination (Oasis pattern)
  // Supports lightweight search without triggering full table loading state
  const fetchTests = useCallback(async (page, limit, search, courseId, isActive, options = {}) => {
    const { skipLoading = false } = options;
    try {
      if (!skipLoading) setLoading(true);
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
      const errorMsg = err.message || 'Failed to fetch tests';
      setError(errorMsg);
      showError('Error Loading Tests', errorMsg);
    } finally {
      if (!skipLoading) setLoading(false);
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

  // Initial fetch - only run once even in Strict Mode
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchTests(1, 10, "", "", undefined);
    fetchCourses();
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
    const isActive = statusFilter === "Active" ? true : statusFilter === "Inactive" ? false : undefined;
    const courseId = courseFilter || "";
    fetchTests(1, pagination.limit, search, courseId, isActive);
  }, [fetchTests, pagination.limit, courseFilter, statusFilter]);

  // Handle filter change from DataTable
  const handleFilterChange = useCallback((filters) => {
    const newCourseFilter = filters.course || "";
    const newStatusFilter = filters.status || "";
    
    setCourseFilter(newCourseFilter);
    setStatusFilter(newStatusFilter);
    
    const isActive = newStatusFilter === "Active" ? true : newStatusFilter === "Inactive" ? false : undefined;
    const courseId = newCourseFilter || "";
    fetchTests(1, pagination.limit, searchTerm, courseId, isActive);
  }, [fetchTests, pagination.limit, searchTerm]);

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
  const filters = [];

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
    }
  ];

  const handleAdd = () => {
    router.push("/tests/add");
  };

  const handleEdit = (test) => {
    router.push(`/tests/${test.id}/edit`);
  };

  const handleDelete = async (test) => {
    const result = await showDeleteConfirm(
      `Delete "${test.title}"?`,
      'This action cannot be undone. All test data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      const response = await testAPI.deleteTest(test.id);
      if (response.success) {
          showSuccess('Test Deleted!', `"${test.title}" has been deleted successfully.`);
        // Refresh current page
        const isActive = statusFilter === "Active" ? true : statusFilter === "Inactive" ? false : undefined;
        const courseId = courseFilter || "";
        await fetchTests(pagination.page, pagination.limit, searchTerm, courseId, isActive);
        } else {
          showError('Delete Failed', response.message || 'Failed to delete test');
        }
      } catch (err) {
        showError('Error', err.message || 'Failed to delete test');
      }
    }
  };

  const handleView = (test) => {
    router.push(`/tests/${test.id}`);
  };

  if (loading && tests.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading tests...</p>
      </div>
    );
  }

  if (error && tests.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Tests"
      data={formattedTests}
      columns={columns}
      searchPlaceholder="Search tests by title or course..."
      filters={filters}
      stats={stats}
      pagination={pagination}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearchChange={handleSearchChange}
      onFilterChange={handleFilterChange}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      serverSide={true}
    />
  );
};

export default TestsTable;
