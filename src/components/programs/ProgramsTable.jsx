"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui";
import { Eye, Edit, Trash2, Plus, Filter, Search, GraduationCap, Users, Award, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
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

  // Explicit search trigger (type + Enter or button)
  const handleSearch = useCallback(() => {
    // Always reset to first page when searching
    fetchPrograms(1, pagination.limit, searchTerm, filterCategory);
  }, [fetchPrograms, pagination.limit, searchTerm, filterCategory]);

  // Handle filter changes - trigger API call immediately (not search)
  const prevFiltersRef = useRef({ filterCategory });
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      return;
    }
    
    // Only trigger if filters actually changed (not search)
    if (prevFiltersRef.current.filterCategory !== filterCategory) {
      prevFiltersRef.current = { filterCategory };
      fetchPrograms(1, pagination.limit, searchTerm, filterCategory);
    }
  }, [filterCategory, fetchPrograms, pagination.limit, searchTerm]);

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

  const handleDelete = async (programId, programTitle) => {
    const result = await showDeleteConfirm(
      `Delete "${programTitle}"?`,
      'This action cannot be undone. All program data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      const response = await programAPI.deleteProgram(programId);
      if (response.success) {
          showSuccess('Program Deleted!', `"${programTitle}" has been deleted successfully.`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        <Button 
          variant="primary" 
          className="flex items-center gap-2"
          onClick={() => router.push('/programs/add')}
        >
          <Plus className="w-4 h-4" />
          Add New Program
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search programs by title or director..."
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

          {/* Category Filter */}
          <div className="lg:w-64">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {Array.from(new Set(formattedPrograms.map(p => p.category))).map(category => (
                <option key={category} value={category}>
                  {category}
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
              <p className="text-sm text-gray-600">Total Programs</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Programs</p>
              <p className="text-2xl font-bold text-green-600">
                {formattedPrograms.filter(p => p.status === "Active").length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">
                {formattedPrograms.reduce((sum, program) => sum + program.participants, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Modules</p>
              <p className="text-2xl font-bold text-gray-900">
                {formattedPrograms.reduce((sum, program) => sum + program.modules, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Programs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Program</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Director</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Participants</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Cost</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formattedPrograms.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-500">
                    No programs found
                  </td>
                </tr>
              ) : (
                formattedPrograms.map((program) => (
                  <tr key={program.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{program.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge color={getDifficultyColor(program.difficulty)} size="sm">
                            {program.difficulty}
                          </Badge>
                          <span className="text-xs text-gray-600">{program.modules} modules</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{program.director}</td>
                    <td className="py-4 px-4">
                      <Badge color="default">{program.category}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{program.duration}</p>
                        <p className="text-xs text-gray-600">
                          {formatDate(program.startDate)} - {formatDate(program.endDate)}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{program.participants}/{program.maxParticipants}</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${getEnrollmentProgress(program.participants, program.maxParticipants)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600">{getEnrollmentProgress(program.participants, program.maxParticipants)}%</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge color={getTypeColor(program.type)}>{program.type}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge color={getStatusColor(program.status)}>{program.status}</Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-900 font-medium">{program.cost}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/programs/details/${program.id}`}>
                          <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/programs/update/${program.id}`}>
                          <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(program.id, program.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
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
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramsTable;
