"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui";
import { Eye, Edit, Trash2, Plus, Filter, Search, Users, UserCheck, Award, MapPin, BookOpen, Loader2 } from "lucide-react";
import * as instructorAPI from "@/lib/api/instructor";

const InstructorTable = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
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

  // Fetch instructors
  const fetchInstructors = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filterDepartment && { department: filterDepartment }),
        ...(filterStatus !== '' && { isActive: filterStatus === 'Active' }),
      };

      const response = await instructorAPI.getAllInstructors(params);
      
      if (response.success) {
        setInstructors(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
        }));
      }
    } catch (err) {
      console.error('Error fetching instructors:', err);
      setError(err.message || 'Failed to fetch instructors');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchInstructors();
  }, [pagination.page, filterDepartment, filterStatus]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchInstructors();
      } else {
        // Reset to page 1 when searching
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this instructor?')) {
      return;
    }

    try {
      const response = await instructorAPI.deleteInstructor(id);
      if (response.success) {
        // Refresh the list
        fetchInstructors();
        fetchStats();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete instructor');
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
    };
  };

  if (loading && instructors.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="lg:w-48">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {departments.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Instructors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInstructors}</p>
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
                  {instructors.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        No instructors found
                      </td>
                    </tr>
                  ) : (
                    instructors.map((instructor) => {
                      const formatted = formatInstructor(instructor);
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
            {pagination.totalPages > 1 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} instructors
            </div>
            <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first, last, current, and pages around current
                        return (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.page - 1 && page <= pagination.page + 1)
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if needed
                        const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                        return (
                          <React.Fragment key={page}>
                            {showEllipsisBefore && <span className="px-2">...</span>}
                            <Button
                              variant={pagination.page === page ? "primary" : "outline"}
                              size="sm"
                              onClick={() => setPagination(prev => ({ ...prev, page }))}
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        );
                      })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
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
