"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
import * as courseAPI from "@/lib/api/course";
import * as enrollmentAPI from "@/lib/api/enrollment";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";

const CoursesTable = () => {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    avgPrice: 0
  });
  const [enrollmentCounts, setEnrollmentCounts] = useState({});
  const isInitialMount = useRef(true);
  const hasInitialFetch = useRef(false);

  // Fetch courses with server-side pagination (Oasis pattern)
  // Supports lightweight search without triggering full table loading state
  const fetchCourses = useCallback(async (page, limit, search, status, category, type, options = {}) => {
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
        ...(status && { status: status.toLowerCase() }),
        ...(category && { category }),
        ...(type && { isOnline: type === "Online" })
      };

      const response = await courseAPI.getAllCourses(params);
      if (response.success) {
        const coursesData = response.data || [];
        setCourses(coursesData);
        if (response.pagination) {
          setPagination({
            page: response.pagination.page || page,
            limit: response.pagination.limit || limit,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0
          });
        }
        
        // Fetch enrollment counts for the current page of courses
        if (coursesData.length > 0) {
          fetchEnrollmentCounts(coursesData.map(c => c._id || c.id));
        }
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      const errorMsg = err.message || 'Failed to fetch courses';
      setError(errorMsg);
      showError('Error Loading Courses', errorMsg);
    } finally {
      if (!skipLoading) setLoading(false);
    }
  }, []);

  // Fetch enrollment counts for specific courses
  const fetchEnrollmentCounts = useCallback(async (courseIds) => {
    try {
      // Fetch all enrollments and count by courseId
      const response = await enrollmentAPI.getAllEnrollments({ limit: 10000 });
      if (response.success) {
        const enrollments = response.data?.enrollments || response.data || [];
        const counts = {};
        
        enrollments.forEach(enrollment => {
          let courseId = null;
          if (enrollment.courseId) {
            // Handle both populated and unpopulated courseId
            if (enrollment.courseId._id) {
              courseId = enrollment.courseId._id.toString();
            } else if (enrollment.courseId.toString && typeof enrollment.courseId.toString === 'function') {
              courseId = enrollment.courseId.toString();
            } else if (typeof enrollment.courseId === 'string') {
              courseId = enrollment.courseId;
            }
          }
          
          if (courseId && courseIds.includes(courseId)) {
            counts[courseId] = (counts[courseId] || 0) + 1;
          }
        });
        
        setEnrollmentCounts(prev => ({ ...prev, ...counts }));
      }
    } catch (err) {
      console.error('Error fetching enrollment counts:', err);
    }
  }, []);

  // Fetch stats and calculate average price from all courses
  const fetchStats = async () => {
    try {
      const [statsResponse, allCoursesResponse] = await Promise.all([
        courseAPI.getCourseStats(),
        courseAPI.getAllCourses({ limit: 10000 }) // Fetch all courses to calculate avg price
      ]);
      
      if (statsResponse.success && statsResponse.data) {
        // Calculate average price from all courses
        let avgPrice = 0;
        if (allCoursesResponse.success && allCoursesResponse.data && allCoursesResponse.data.length > 0) {
          const totalPrice = allCoursesResponse.data.reduce((sum, course) => {
            return sum + (course.price || 0);
          }, 0);
          avgPrice = totalPrice / allCoursesResponse.data.length;
        }
        
        setStats({
          totalCourses: statsResponse.data.totalCourses || 0,
          activeCourses: statsResponse.data.activeCourses || 0,
          avgPrice: avgPrice
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Initial fetch - only run once even in Strict Mode
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchCourses(1, 10, "", "", "", "");
    fetchStats();
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
    fetchCourses(1, pagination.limit, search, statusFilter, categoryFilter, typeFilter);
  }, [fetchCourses, pagination.limit, statusFilter, categoryFilter, typeFilter]);

  // Handle filter change from DataTable
  const handleFilterChange = useCallback((filters) => {
    const newStatusFilter = filters.status || "";
    const newCategoryFilter = filters.category || "";
    const newTypeFilter = filters.type || "";
    
    setStatusFilter(newStatusFilter);
    setCategoryFilter(newCategoryFilter);
    setTypeFilter(newTypeFilter);
    
    fetchCourses(1, pagination.limit, searchTerm, newStatusFilter, newCategoryFilter, newTypeFilter);
  }, [fetchCourses, pagination.limit, searchTerm]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    fetchCourses(newPage, pagination.limit, searchTerm, statusFilter, categoryFilter, typeFilter);
  }, [fetchCourses, pagination.limit, searchTerm, statusFilter, categoryFilter, typeFilter]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    fetchCourses(1, newPageSize, searchTerm, statusFilter, categoryFilter, typeFilter);
  }, [fetchCourses, searchTerm, statusFilter, categoryFilter, typeFilter]);

  // Format course data for display
  const formatCourses = (courses) => {
    return courses.map(course => {
      const instructor = course.instructor?.userId || {};
      const instructorName = instructor.firstName && instructor.lastName
        ? `${instructor.firstName} ${instructor.lastName}`
        : instructor.username || 'N/A';
      
      const courseId = course._id || course.id;
      const studentCount = enrollmentCounts[courseId] || 0;
      
      return {
        id: courseId,
        title: course.title,
        instructor: instructorName,
        students: studentCount,
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

  // Get unique categories from current courses (for filter dropdown)
  const uniqueCategories = Array.from(
    new Set(courses.map(c => c.category?.name).filter(Boolean))
  ).sort();

  const filters = [
    {
      key: "status",
      label: "Status",
      options: ["active", "draft", "inactive"]
    },
    {
      key: "category",
      label: "Category",
      options: uniqueCategories
    },
    {
      key: "type",
      label: "Type",
      options: ["Online", "Offline"]
    }
  ];

  const computedStats = [
    {
      label: "Total Courses",
      value: stats.totalCourses || pagination.total || 0,
      icon: "C",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Active Courses",
      value: stats.activeCourses || 0,
      icon: "✓",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      color: "text-green-600"
    },
    {
      label: "Avg. Price",
      value: stats.avgPrice ? `$${Math.round(stats.avgPrice)}` : "$0",
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
    const result = await showDeleteConfirm(
      `Delete "${course.title}"?`,
      'This action cannot be undone. All course data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
      try {
        const response = await courseAPI.deleteCourse(course.id);
        if (response.success) {
          showSuccess('Course Deleted!', `"${course.title}" has been deleted successfully.`);
          // Refresh current page
          await fetchCourses(pagination.page, pagination.limit, searchTerm, statusFilter, categoryFilter, typeFilter);
          await fetchStats();
        } else {
          showError('Delete Failed', response.message || 'Failed to delete course');
        }
      } catch (err) {
        showError('Error', err.message || 'Failed to delete course');
      }
    }
  };

  const handleView = (course) => {
    router.push(`/courses/details/${course.id}`);
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading courses...</p>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Courses"
      data={formattedCourses}
      columns={columns}
      searchPlaceholder="Search courses by title, instructor, or category..."
      filters={filters}
      stats={computedStats}
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

export default CoursesTable;
