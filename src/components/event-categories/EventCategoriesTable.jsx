"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
import * as categoryAPI from "@/lib/api/eventCategory";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";

const EventCategoriesTable = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // For accurate stats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const isInitialMount = useRef(true);
  const hasInitialFetch = useRef(false);

  // Fetch categories with server-side pagination (Oasis pattern)
  const fetchCategories = useCallback(async (page, limit, search, options = {}) => {
    const { skipLoading = false } = options;
    try {
      if (!skipLoading) setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        sort_column: 'createdAt',
        sort_direction: 'desc',
        ...(search && { search })
      };
      
      const response = await categoryAPI.getAllCategories(params);
      if (response.success) {
        setCategories(response.data || []);
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
      console.error('Error fetching categories:', err);
      const errorMsg = err.message || 'Failed to fetch categories';
      setError(errorMsg);
      showError('Error Loading Event Themes', errorMsg);
    } finally {
      if (!skipLoading) setLoading(false);
    }
  }, []);

  // Fetch all categories for accurate stats - only fetch once
  const fetchAllCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories({ limit: 10000 });
      if (response.success) {
        setAllCategories(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching all categories:', err);
    }
  };

  // Initial fetch - only run once even in Strict Mode
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchCategories(1, 10, "");
    fetchAllCategories();
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search change from DataTable
  const handleSearchChange = useCallback((search) => {
    setSearchTerm(search);
    fetchCategories(1, pagination.limit, search);
  }, [fetchCategories, pagination.limit]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    fetchCategories(newPage, pagination.limit, searchTerm);
  }, [fetchCategories, pagination.limit, searchTerm]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    fetchCategories(1, newPageSize, searchTerm);
  }, [fetchCategories, searchTerm]);

  const handleDelete = async (category) => {
    const result = await showDeleteConfirm(
      'Delete Event Theme?',
      'This action cannot be undone. All theme data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      const response = await categoryAPI.deleteCategory(category.id);
      if (response.success) {
          showSuccess('Theme Deleted!', 'The event theme has been deleted successfully.');
        await fetchCategories(pagination.page, pagination.limit, searchTerm);
        } else {
          showError('Delete Failed', response.message || 'Failed to delete event theme');
        }
      } catch (err) {
        showError('Error', err.message || 'Failed to delete event theme');
      }
    }
  };

  const handleEdit = (category) => {
    router.push(`/event-categories/${category.id}/edit`);
  };

  const handleView = (category) => {
    router.push(`/event-categories/${category.id}/view`);
  };

  const handleAdd = () => {
    router.push('/event-categories/add');
  };

  // Format category data
  const formatCategory = (category) => {
    return {
      id: category._id,
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
      createdAt: category.createdAt,
      rawCategory: category
    };
  };

  // Format categories for display
  const formattedCategories = categories.map(formatCategory);

  const columns = [
    {
      key: "name",
      label: "Theme",
      render: (value, item) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          {item.description && (
            <p className="text-sm text-gray-600">{item.description}</p>
          )}
        </div>
      )
    },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <Badge color={value ? "success" : "error"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      )
    }
  ];

  const filters = [];

  const stats = [
    {
      label: "Total Themes",
      value: pagination.total || categories.length,
      icon: "🎨",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Active Themes",
      value: allCategories.filter(c => c.isActive).length,
      icon: "✓",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      color: "text-green-600"
    }
  ];

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading event themes...</p>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Event Themes"
      data={formattedCategories}
      columns={columns}
      searchPlaceholder="Search themes..."
      filters={filters}
      stats={stats}
      pagination={pagination}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearchChange={handleSearchChange}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      serverSide={true}
    />
  );
};

export default EventCategoriesTable;

