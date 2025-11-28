"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import { Search, Filter, Eye, Edit, Trash2, Plus } from "lucide-react";
import * as courseAPI from "@/lib/api/course";

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

  // Fetch courses with server-side pagination (Oasis pattern)
  const fetchCourses = useCallback(async (page, limit, search, status, category, type) => {
    try {
      setLoading(true);
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
        setCourses(response.data || []);
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
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
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

  // Initial fetch
  useEffect(() => {
    fetchCourses(1, 10, "", "", "", "");
    fetchStats();
  }, [fetchCourses]);

  // Debounced search (300ms like Oasis)
  const searchTimeoutRef = useRef(null);
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchCourses(1, pagination.limit, searchTerm, statusFilter, categoryFilter, typeFilter);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchCourses, pagination.limit, statusFilter, categoryFilter, typeFilter]);

  // Handle filter changes - trigger API call
  useEffect(() => {
    fetchCourses(1, pagination.limit, searchTerm, statusFilter, categoryFilter, typeFilter);
  }, [statusFilter, categoryFilter, typeFilter, fetchCourses, pagination.limit, searchTerm]);

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
      
      return {
        id: course._id,
        title: course.title,
        instructor: instructorName,
        students: 0, // This would need to come from enrollment data
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
      key: "category",
      label: "Category",
      options: uniqueCategories
    },
    {
      key: "status",
      label: "Status",
      options: ["active", "draft", "inactive"]
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
    if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
      try {
        const response = await courseAPI.deleteCourse(course.id);
        if (response.success) {
          // Refresh current page
          await fetchCourses(pagination.page, pagination.limit, searchTerm, statusFilter, categoryFilter, typeFilter);
          await fetchStats();
        }
      } catch (err) {
        alert(err.message || 'Failed to delete course');
      }
    }
  };

  const handleView = (course) => {
    router.push(`/courses/details/${course.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading courses...</p>
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
      {computedStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {computedStats.map((stat, index) => (
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
            <h2 className="text-2xl font-bold text-gray-900">Courses</h2>
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Course
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses by title, instructor, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Category Filter */}
            {uniqueCategories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading courses...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : formattedCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No courses found
              </p>
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
                  {formattedCourses.map((item, index) => (
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

export default CoursesTable;
