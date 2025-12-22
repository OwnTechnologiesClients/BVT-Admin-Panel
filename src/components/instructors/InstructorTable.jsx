"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui";
import { Eye, Edit, Trash2, Plus, Filter, Search, Users, UserCheck, Award, BookOpen } from "lucide-react";
import * as instructorAPI from "@/lib/api/instructor";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";

const InstructorTable = () => {
  const router = useRouter();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    totalInstructors: 0,
    activeInstructors: 0,
    coursesTaught: 0,
    totalStudents: 0,
  });

  // Department mapping from backend enum to display name
  const departmentMap = {
    'marine-engineering': 'Marine Engineering',
    'navigation': 'Navigation',
    'maritime-safety': 'Maritime Safety',
    'naval-operations': 'Naval Operations',
    'submarine-operations': 'Submarine Operations',
  };

  const departments = [
    { value: '', label: 'All Departments' },
    { value: 'marine-engineering', label: 'Marine Engineering' },
    { value: 'navigation', label: 'Navigation' },
    { value: 'maritime-safety', label: 'Maritime Safety' },
    { value: 'naval-operations', label: 'Naval Operations' },
    { value: 'submarine-operations', label: 'Submarine Operations' },
  ];

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  // Fetch instructors with server-side pagination (Oasis pattern)
  // Supports lightweight search without triggering full table loading state
  const fetchInstructors = useCallback(async (page, limit, search, department, status, options = {}) => {
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
        ...(department && { department }),
        ...(status && { isActive: status === 'Active' })
      };

      const response = await instructorAPI.getAllInstructors(params);
      
      if (response.success) {
        setInstructors(response.data || []);
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
      console.error('Error fetching instructors:', err);
      const errorMsg = err.message || 'Failed to fetch instructors';
      setError(errorMsg);
      showError('Error Loading Instructors', errorMsg);
    } finally {
      if (!skipLoading) setLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await instructorAPI.getInstructorStats();
      if (response.success && response.data) {
        setStats({
          totalInstructors: response.data.totalInstructors || 0,
          activeInstructors: response.data.activeInstructors || 0,
          coursesTaught: 0, // This would need to come from courses API
          totalStudents: 0, // This would need to come from students API
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Initial fetch
  const isInitialMount = useRef(true);
  const hasInitialFetch = useRef(false);
  
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchInstructors(1, 10, "", "", "");
    fetchStats();
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchInstructors]);

  // Explicit search trigger (type + Enter or button)
  const handleSearch = useCallback(() => {
    // Always reset to first page when searching
    fetchInstructors(1, pagination.limit, searchTerm, filterDepartment, filterStatus);
  }, [fetchInstructors, pagination.limit, searchTerm, filterDepartment, filterStatus]);

  // Handle filter changes - trigger API call immediately (not search)
  const prevFiltersRef = useRef({ filterDepartment, filterStatus });
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      return;
    }
    
    // Only trigger if filters actually changed (not search)
    if (prevFiltersRef.current.filterDepartment !== filterDepartment || 
        prevFiltersRef.current.filterStatus !== filterStatus) {
      prevFiltersRef.current = { filterDepartment, filterStatus };
      fetchInstructors(1, pagination.limit, searchTerm, filterDepartment, filterStatus);
    }
  }, [filterDepartment, filterStatus, fetchInstructors, pagination.limit, searchTerm]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    fetchInstructors(newPage, pagination.limit, searchTerm, filterDepartment, filterStatus);
  }, [fetchInstructors, pagination.limit, searchTerm, filterDepartment, filterStatus]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    fetchInstructors(1, newPageSize, searchTerm, filterDepartment, filterStatus);
  }, [fetchInstructors, searchTerm, filterDepartment, filterStatus]);

  // Format instructor data from backend
  const formatInstructor = (instructor) => {
    const user = instructor.userId || {};
    const department = departmentMap[instructor.department] || instructor.department || 'N/A';
    
    return {
      id: instructor._id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      department: department,
      departmentKey: instructor.department,
      isActive: instructor.isActive,
      experience: instructor.experience ? `${instructor.experience} years` : 'N/A',
      rating: instructor.rating || 0,
      specializations: instructor.specializations || '',
      locations: instructor.locations || [],
      certifications: instructor.certifications || [],
      createdAt: instructor.createdAt,
      rawInstructor: instructor // Keep original for filtering
    };
  };

  // Format instructors for display
  const formattedInstructors = instructors.map(formatInstructor);

  const handleDelete = async (id) => {
    const result = await showDeleteConfirm(
      'Delete Instructor?',
      'This action cannot be undone. All instructor data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      const response = await instructorAPI.deleteInstructor(id);
      if (response.success) {
          showSuccess('Instructor Deleted!', 'The instructor has been deleted successfully.');
        // Refresh current page
        await fetchInstructors(pagination.page, pagination.limit, searchTerm, filterDepartment, filterStatus);
        fetchStats();
        } else {
          showError('Delete Failed', response.message || 'Failed to delete instructor');
        }
      } catch (err) {
        showError('Error', err.message || 'Failed to delete instructor');
      }
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? "success" : "error";
  };

  const getDepartmentColor = (department) => {
    const dept = department?.toLowerCase();
    switch (dept) {
      case "navigation": return "info";
      case "marine-engineering":
      case "marine engineering": return "warning";
      case "maritime-safety":
      case "maritime safety": return "success";
      case "naval-operations":
      case "naval operations": return "default";
      case "submarine-operations":
      case "submarine operations": return "success";
      default: return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    if (!rating) return <span className="text-gray-400 text-sm">No rating</span>;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading instructors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Instructors Management</h2>
          <p className="text-gray-600">Manage and monitor all instructors and their courses</p>
        </div>
        <Button 
          variant="primary" 
          className="flex items-center gap-2"
          onClick={() => router.push('/instructors/add')}
        >
          <Plus className="w-4 h-4" />
          Add New Instructor
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search instructors by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {departments.filter(d => d.value).map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            </select>

        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Instructors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInstructors || pagination.total || 0}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Instructors</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeInstructors}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Courses Taught</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.coursesTaught}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalStudents}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Instructors Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Instructor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Experience</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
                  {formattedInstructors.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        No instructors found
                      </td>
                    </tr>
                  ) : (
                    formattedInstructors.map((formatted) => {
                      return (
                        <tr key={formatted.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                                  {formatted.firstName[0] || ''}{formatted.lastName[0] || ''}
                        </span>
                      </div>
                      <div>
                                <p className="font-medium text-gray-900">
                                  {formatted.firstName} {formatted.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{formatted.email}</p>
                                {formatted.specializations && (
                                  <p className="text-xs text-gray-500">{formatted.specializations}</p>
                                )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                            <Badge color={getDepartmentColor(formatted.departmentKey)}>
                              {formatted.department}
                            </Badge>
                  </td>
                          <td className="py-4 px-4 text-gray-900">{formatted.experience}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                              <div className="flex">{renderStars(formatted.rating)}</div>
                              {formatted.rating > 0 && (
                                <span className="text-sm text-gray-600 ml-1">{formatted.rating.toFixed(1)}</span>
                              )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                            <Badge color={getStatusColor(formatted.isActive)}>
                              {formatted.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                                href={`/instructors/details/${formatted.id}`}
                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                              <Link
                                href={`/instructors/update/${formatted.id}`}
                        className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded"
                        title="Edit Instructor"
                      >
                        <Edit className="w-4 h-4" />
                              </Link>
                      <button
                                onClick={() => handleDelete(formatted.id)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete Instructor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                      );
                    })
                  )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
            {pagination.total > 0 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left side: Items info and page size selector */}
            <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> instructors
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
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Previous
                    </Button>
              
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
                            <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "primary" : "outline"}
                              size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="min-w-[2.5rem]"
                            >
                      {pageNum}
                            </Button>
                        );
                      })}
              </div>
              
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Next
                    </Button>
            </div>
          </div>
        </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InstructorTable;
