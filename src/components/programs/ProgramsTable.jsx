"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
import * as programAPI from "@/lib/api/program";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";

const ProgramsTable = () => {
  const router = useRouter();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch programs with server-side pagination (Oasis pattern)
  // Supports lightweight search without triggering full table loading state
  const fetchPrograms = useCallback(async (page, limit, search, category, options = {}) => {
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
        ...(category && { category })
      };

      const response = await programAPI.getAllPrograms(params);
      if (response.success) {
        setPrograms(response.data || []);
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
      console.error('Error fetching programs:', err);
      setError(err.message || 'Failed to fetch programs');
    } finally {
      if (!skipLoading) setLoading(false);
    }
  }, []);

  // Initial fetch
  const isInitialMount = useRef(true);
  const hasInitialFetch = useRef(false);
  
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchPrograms(1, 10, "", "");
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchPrograms]);

  // Handle search change from DataTable
  const handleSearchChange = useCallback((search) => {
    setSearchTerm(search);
    fetchPrograms(1, pagination.limit, search, filterCategory);
  }, [fetchPrograms, pagination.limit, filterCategory]);

  // Handle filter change from DataTable
  const handleFilterChange = useCallback((filters) => {
    const newCategoryFilter = filters.category || "";
    setFilterCategory(newCategoryFilter);
    fetchPrograms(1, pagination.limit, searchTerm, newCategoryFilter);
  }, [fetchPrograms, pagination.limit, searchTerm]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    fetchPrograms(newPage, pagination.limit, searchTerm, filterCategory);
  }, [fetchPrograms, pagination.limit, searchTerm, filterCategory]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    fetchPrograms(1, newPageSize, searchTerm, filterCategory);
  }, [fetchPrograms, searchTerm, filterCategory]);

  // Format program data
  const formatProgram = (program) => {
    const startDate = program.startDate ? new Date(program.startDate).toISOString().split('T')[0] : 'N/A';
    const endDate = program.endDate ? new Date(program.endDate).toISOString().split('T')[0] : 'N/A';
    
    // Determine status based on dates
    let status = "Upcoming";
    if (program.startDate && program.endDate) {
      const now = new Date();
      const start = new Date(program.startDate);
      const end = new Date(program.endDate);
      if (now > end) {
        status = "Completed";
      } else if (now >= start && now <= end) {
        status = "Active";
      } else if (now < start) {
        status = "Upcoming";
      }
    }

    // Format type
    const type = program.isOnline ? 'Online' : 'Offline';

    // Format cost
    const cost = program.cost === 0 || program.cost === null ? 'Free' : `$${program.cost}`;

    return {
      id: program._id,
      title: program.title,
      category: program.category?.name || 'N/A',
      director: program.programDirector || 'N/A',
      duration: program.duration || 'N/A',
      startDate: startDate,
      endDate: endDate,
      participants: program.participants || 0, // This would need to come from enrollments
      maxParticipants: program.maxParticipants || 0,
      status: status,
      type: type,
      cost: cost,
      difficulty: program.difficulty || 'beginner',
      modules: program.modules?.length || 0,
      certifications: program.certifications || [],
      createdAt: program.createdAt
    };
  };

  // Format programs for display
  const formattedPrograms = programs.map(formatProgram);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "success";
      case "Upcoming": return "info";
      case "Draft": return "warning";
      case "Completed": return "default";
      case "Cancelled": return "error";
      default: return "default";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Online": return "info";
      case "Offline": return "default";
      case "Hybrid": return "warning";
      default: return "default";
    }
  };

  const getDifficultyColor = (difficulty) => {
    const difficultyMap = {
      'beginner': 'info',
      'intermediate': 'warning',
      'advanced': 'error',
      'expert': 'error'
    };
    return difficultyMap[difficulty] || 'default';
  };

  const formatDate = (dateString) => {
    if (dateString === 'N/A') return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEnrollmentProgress = (participants, max) => {
    if (max === 0) return 0;
    return Math.round((participants / max) * 100);
  };

  const handleDelete = async (program) => {
    const result = await showDeleteConfirm(
      `Delete "${program.title}"?`,
      'This action cannot be undone. All program data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      const response = await programAPI.deleteProgram(program.id);
      if (response.success) {
          showSuccess('Program Deleted!', `"${program.title}" has been deleted successfully.`);
        // Refresh current page
        await fetchPrograms(pagination.page, pagination.limit, searchTerm, filterCategory);
        } else {
          showError('Delete Failed', response.message || 'Failed to delete program');
        }
      } catch (err) {
        showError('Error', err.message || 'Failed to delete program');
      }
    }
  };

  const handleEdit = (program) => {
    router.push(`/programs/update/${program.id}`);
  };

  const handleView = (program) => {
    router.push(`/programs/details/${program.id}`);
  };

  const handleAdd = () => {
    router.push('/programs/add');
  };

  const columns = [
    {
      key: "title",
      label: "Program",
      render: (value, item) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge color={getDifficultyColor(item.difficulty)} size="sm">
              {item.difficulty}
            </Badge>
            <span className="text-xs text-gray-600">{item.modules} modules</span>
          </div>
        </div>
      )
    },
    {
      key: "director",
      label: "Director"
    },
    {
      key: "category",
      label: "Category",
      render: (value) => <Badge color="default">{value}</Badge>
    },
    {
      key: "duration",
      label: "Duration",
      render: (value, item) => (
        <div>
          <p className="text-sm text-gray-900">{value}</p>
          <p className="text-xs text-gray-600">
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </p>
        </div>
      )
    },
    {
      key: "participants",
      label: "Participants",
      render: (value, item) => {
        const max = item.maxParticipants || 1;
        const percentage = getEnrollmentProgress(value, max);
        return (
          <div>
            <p className="text-sm text-gray-900">{value}/{max}</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600">{percentage}%</p>
          </div>
        );
      }
    },
    {
      key: "type",
      label: "Type",
      render: (value) => <Badge color={getTypeColor(value)}>{value}</Badge>
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <Badge color={getStatusColor(value)}>{value}</Badge>
    },
    {
      key: "cost",
      label: "Cost",
      render: (value) => <span className="font-medium">{value}</span>
    }
  ];

  const filters = [
    {
      key: "category",
      label: "Category",
      options: Array.from(new Set(formattedPrograms.map(p => p.category))).filter(Boolean)
    }
  ];

  const stats = [
    {
      label: "Total Programs",
      value: pagination.total || 0,
      icon: "🎓",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Active Programs",
      value: formattedPrograms.filter(p => p.status === "Active").length,
      icon: "✓",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      color: "text-green-600"
    },
    {
      label: "Total Participants",
      value: formattedPrograms.reduce((sum, program) => sum + program.participants, 0),
      icon: "👥",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      label: "Total Modules",
      value: formattedPrograms.reduce((sum, program) => sum + program.modules, 0),
      icon: "📚",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
    }
  ];

  if (loading && programs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading programs...</p>
      </div>
    );
  }

  if (error && programs.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Programs"
      data={formattedPrograms}
      columns={columns}
      searchPlaceholder="Search programs by title or director..."
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

export default ProgramsTable;
