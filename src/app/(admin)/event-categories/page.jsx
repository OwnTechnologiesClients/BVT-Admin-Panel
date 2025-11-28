"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { Plus, Trash2, Edit, BookOpen, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import * as categoryAPI from "@/lib/api/eventCategory";

export default function EventCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    totalEvents: 0
  });

  // Fetch categories with pagination
  const fetchCategories = useCallback(async (page, limit) => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryAPI.getAllCategories({ 
        page, 
        limit,
        sort_column: 'createdAt',
        sort_direction: 'desc' // Newest first
      });
      if (response.success) {
        setCategories(response.data || []);
        if (response.pagination) {
          const newPagination = {
            page: response.pagination.page || page,
            limit: response.pagination.limit || limit,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0
          };
          
          setPagination(prev => {
            if (
              prev.page === newPagination.page &&
              prev.limit === newPagination.limit &&
              prev.total === newPagination.total &&
              prev.totalPages === newPagination.totalPages
            ) {
              return prev;
            }
            return newPagination;
          });
        }
        // Update stats from pagination total
        const active = (response.data || []).filter(c => c.isActive).length;
        setStats({
          totalCategories: response.pagination?.total || response.data?.length || 0,
          activeCategories: active,
          inactiveCategories: (response.data?.length || 0) - active,
          totalEvents: 0 // This would need to come from events API
        });
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCategories(1, 10);
  }, [fetchCategories]);

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchCategories(newPage, pagination.limit);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    fetchCategories(1, newPageSize);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this theme?")) {
      return;
    }

    try {
      const response = await categoryAPI.deleteCategory(categoryId);
      if (response.success) {
        await fetchCategories(pagination.page, pagination.limit);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete theme');
    }
  };

  // Categories are already sorted by newest first from API
  const sortedCategories = categories;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Event Themes"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Event Themes", href: "/event-categories" }
        ]}
      />

      <div className="flex items-center justify-end">
        <Button
          onClick={() => router.push('/event-categories/add')}
          className="flex items-center gap-2"
          variant="primary"
        >
          <Plus className="w-4 h-4" />
          Add Theme
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Themes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Themes</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeCategories}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive Themes</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactiveCategories}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-semibold">✗</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Theme</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Slug</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No themes found
                  </td>
                </tr>
              ) : (
                sortedCategories.map((category) => {
                  const categoryId = category._id || category.id;
                  return (
                    <tr key={categoryId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-gray-700">{category.slug}</span>
                      </td>
                  <td className="py-4 px-4">
                    <Badge color={category.isActive ? "success" : "error"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                          <Link href={`/event-categories/${categoryId}/view`}>
                            <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/event-categories/${categoryId}/edit`}>
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </Button>
                          </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                            onClick={() => handleDelete(categoryId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
}

