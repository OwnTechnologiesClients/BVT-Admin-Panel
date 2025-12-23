"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
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

  // Handle search change from DataTable
  const handleSearchChange = useCallback((search) => {
    setSearchTerm(search);
    fetchInstructors(1, pagination.limit, search, filterDepartment, filterStatus);
  }, [fetchInstructors, pagination.limit, filterDepartment, filterStatus]);

  // Handle filter change from DataTable
  const handleFilterChange = useCallback((filters) => {
    const newDepartmentFilter = filters.department || "";
    const newStatusFilter = filters.status || "";
    
    setFilterDepartment(newDepartmentFilter);
    setFilterStatus(newStatusFilter);
    
    fetchInstructors(1, pagination.limit, searchTerm, newDepartmentFilter, newStatusFilter);
  }, [fetchInstructors, pagination.limit, searchTerm]);

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

  const handleDelete = async (instructor) => {
    const result = await showDeleteConfirm(
      'Delete Instructor?',
      'This action cannot be undone. All instructor data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      const response = await instructorAPI.deleteInstructor(instructor.id);
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

  const handleEdit = (instructor) => {
    router.push(`/instructors/update/${instructor.id}`);
  };

  const handleView = (instructor) => {
    router.push(`/instructors/details/${instructor.id}`);
  };

  const handleAdd = () => {
    router.push('/instructors/add');
  };

  const columns = [
    {
      key: "name",
      label: "Instructor",
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {item.firstName[0] || ''}{item.lastName[0] || ''}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {item.firstName} {item.lastName}
            </p>
            <p className="text-sm text-gray-600">{item.email}</p>
            {item.specializations && (
              <p className="text-xs text-gray-500">{item.specializations}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: "department",
      label: "Department",
      render: (value, item) => (
        <Badge color={getDepartmentColor(item.departmentKey)}>
          {value}
        </Badge>
      )
    },
    {
      key: "experience",
      label: "Experience"
    },
    {
      key: "rating",
      label: "Rating",
      render: (value) => (
        <div className="flex items-center gap-1">
          <div className="flex">{renderStars(value)}</div>
          {value > 0 && (
            <span className="text-sm text-gray-600 ml-1">{value.toFixed(1)}</span>
          )}
        </div>
      )
    },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <Badge color={getStatusColor(value)}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  const filters = [];

  const statsForTable = [
    {
      label: "Total Instructors",
      value: stats.totalInstructors || pagination.total || 0,
      icon: "👥",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Active Instructors",
      value: stats.activeInstructors,
      icon: "✓",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      color: "text-green-600"
    }
  ];

  // Format instructors to include name field
  const formattedData = formattedInstructors.map(i => ({
    ...i,
    name: `${i.firstName} ${i.lastName}`
  }));

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

  if (loading && instructors.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading instructors...</p>
      </div>
    );
  }

  if (error && instructors.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Instructors Management"
      description="Manage and monitor all instructors and their courses"
      data={formattedData}
      columns={columns}
      searchPlaceholder="Search instructors by name, email, or department..."
      filters={filters}
      stats={statsForTable}
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

export default InstructorTable;
