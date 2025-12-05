"use client";

import React, { useState, useEffect, useRef } from "react";
import { Badge, Button } from "@/components/ui";
import { Eye, Edit, Trash2, Plus, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";

const DataTable = ({ 
  title, 
  description, 
  data = [], 
  columns, 
  searchPlaceholder = "Search...",
  onAdd,
  onEdit,
  onDelete,
  onView,
  filters = [],
  stats = [],
  // Pagination props
  pagination = null, // { total, page, limit, totalPages }
  onPageChange = null, // (page) => void
  onPageSizeChange = null, // (pageSize) => void
  // Search props for server-side search
  onSearchChange = null, // (searchTerm) => void
  // Filter props for server-side filtering
  onFilterChange = null, // (filters) => void
  // Whether to use server-side pagination/filtering
  serverSide = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(pagination?.page || 1);
  const [pageSize, setPageSize] = useState(pagination?.limit || 10);

  // Update current page when pagination prop changes (only if different)
  useEffect(() => {
    if (pagination?.page && pagination.page !== currentPage) {
      setCurrentPage(pagination.page);
    }
  }, [pagination?.page, currentPage]);

  // Update page size when pagination prop changes (only if different)
  useEffect(() => {
    if (pagination?.limit && pagination.limit !== pageSize) {
      setPageSize(pagination.limit);
    }
  }, [pagination?.limit, pageSize]);

  // Track if this is the initial mount
  const isInitialMount = useRef(true);

  // Handle search with debounce for server-side
  useEffect(() => {
    // Skip on initial mount to prevent unnecessary API calls
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Skip if searchTerm is empty (user cleared the search)
    if (!searchTerm) {
      return;
    }

    if (serverSide && onSearchChange) {
      const timeoutId = setTimeout(() => {
        onSearchChange(searchTerm);
        // Don't set currentPage here - let the parent handle it via pagination prop
      }, 500);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, serverSide]); // onSearchChange is intentionally excluded to prevent infinite loops

  // Client-side filtering (only if not server-side)
  const filteredData = serverSide ? data : data.filter(item => {
    const matchesSearch = Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilters = Object.entries(activeFilters).every(([key, value]) => 
      !value || item[key] === value
    );
    
    return matchesSearch && matchesFilters;
  });

  // Client-side pagination (only if not server-side)
  const totalItems = serverSide ? (pagination?.total || 0) : filteredData.length;
  const totalPages = serverSide ? (pagination?.totalPages || 1) : Math.ceil(filteredData.length / pageSize);
  const startIndex = serverSide ? ((currentPage - 1) * pageSize) : 0;
  const endIndex = serverSide ? (startIndex + data.length) : (startIndex + pageSize);
  const displayData = serverSide ? data : filteredData.slice(startIndex, endIndex);

  const handleFilterChange = (filterKey, value) => {
    const newFilters = {
      ...activeFilters,
      [filterKey]: value === "All" ? "" : value
    };
    setActiveFilters(newFilters);
    
    if (serverSide && onFilterChange) {
      onFilterChange(newFilters);
      // Don't set currentPage here - let the parent handle it via pagination prop
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setCurrentPage(newPage);
    if (serverSide && onPageChange) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    // Don't update local state - let parent handle it via pagination prop
    if (serverSide && onPageSizeChange) {
      onPageSizeChange(newPageSize);
    } else {
      // Only update local state for client-side pagination
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions - Only show if title is provided */}
      {(title || onAdd) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {title && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {description && <p className="text-gray-600">{description}</p>}
            </div>
          )}
          <div className="flex items-center gap-3">
            {onAdd && (
              <Button variant="primary" onClick={onAdd} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New
              </Button>
            )}
          </div>
        </div>
      )}

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

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Dynamic Filters */}
          {filters.map((filter, index) => (
            <div key={index} className="lg:w-64">
              <select
                value={activeFilters[filter.key] || ""}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All {filter.label}</option>
                {filter.options.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}

        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
              {displayData.length > 0 ? (
                displayData.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="py-4 px-4">
                        {column.render ? column.render(item[column.key], item) : item[column.key]}
                      </td>
                    ))}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {onView && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onView(item)}
                            className="text-gray-700 hover:text-gray-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onEdit(item)}
                            className="text-gray-700 hover:text-gray-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onDelete(item)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="py-8 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(totalItems > 0 || (serverSide && pagination)) && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left side: Items info and page size selector */}
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{" "}
                  <span className="font-medium">{totalItems}</span> items
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Show:</label>
                  <select
                    value={pageSize}
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
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        className="min-w-[2.5rem]"
                      >
                        1
                      </Button>
                      {currentPage > 4 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                    </>
                  )}
                  
                  {getPageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="min-w-[2.5rem]"
                    >
                      {pageNum}
                    </Button>
                  ))}
                  
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="min-w-[2.5rem]"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
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

export default DataTable;
