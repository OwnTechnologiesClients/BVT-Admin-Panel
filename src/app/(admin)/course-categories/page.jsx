"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { Plus, Trash2, Edit, BookOpen, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import * as categoryAPI from "@/lib/api/courseCategory";

export default function CourseCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    totalCourses: 0
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryAPI.getAllCategories({ limit: 100 });
      if (response.success) {
        setCategories(response.data || []);
        // Update stats
        const active = (response.data || []).filter(c => c.isActive).length;
        setStats({
          totalCategories: response.data?.length || 0,
          activeCategories: active,
          inactiveCategories: (response.data?.length || 0) - active,
          totalCourses: 0 // This would need to come from courses API
        });
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await categoryAPI.deleteCategory(categoryId);
      if (response.success) {
        await fetchCategories();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

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
        pageTitle="Course Categories"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Course Categories", href: "/course-categories" }
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Categories</h2>
          <p className="text-gray-600">Manage course categories</p>
        </div>
        <Button
          onClick={() => router.push('/course-categories/add')}
          className="flex items-center gap-2"
          variant="primary"
        >
          <Plus className="w-4 h-4" />
          Add Category
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
              <p className="text-sm text-gray-600">Total Categories</p>
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
              <p className="text-sm text-gray-600">Active Categories</p>
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
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive Categories</p>
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
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Slug</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No categories found
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
                          <Link href={`/course-categories/${categoryId}/view`}>
                            <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/course-categories/${categoryId}/edit`}>
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
      </div>
    </div>
  );
}
