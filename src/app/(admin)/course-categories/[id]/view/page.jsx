"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { ArrowLeft, Edit, Loader2, Calendar, User } from "lucide-react";
import * as categoryAPI from "@/lib/api/courseCategory";

export default function ViewCategoryPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await categoryAPI.getCategoryById(id);
        if (response.success) {
          setCategory(response.data);
        } else {
          setError('Category not found');
        }
      } catch (err) {
        console.error('Error fetching category:', err);
        setError(err.message || 'Failed to fetch category');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb 
          pageTitle="Category Details"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Course Categories", href: "/course-categories" },
            { label: "Category Details", href: `/course-categories/${id}/view` }
          ]}
        />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-600">{error || 'Category not found'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/course-categories')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Category Details"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Course Categories", href: "/course-categories" },
          { label: "Category Details", href: `/course-categories/${id}/view` }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push('/course-categories')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push(`/course-categories/${id}/edit`)}
        >
          <Edit className="w-4 h-4" />
          Edit Category
        </Button>
      </div>

      {/* Category Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-gray-600 mt-2">{category.description || 'No description available'}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge color={category.isActive ? "success" : "error"}>
              {category.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Category Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900 mt-1">{category.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Slug</label>
              <p className="text-gray-900 mt-1 font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                {category.slug}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <p className="text-gray-900 mt-1 whitespace-pre-line">
                {category.description || 'No description'}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
          <div className="space-y-3">
            {category.createdAt && (
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created At
                </label>
                <p className="text-gray-900 mt-1">
                  {new Date(category.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {category.createdBy && (
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Created By
                </label>
                <p className="text-gray-900 mt-1">
                  {category.createdBy.firstName} {category.createdBy.lastName}
                </p>
              </div>
            )}

            {category.updatedAt && (
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Last Updated
                </label>
                <p className="text-gray-900 mt-1">
                  {new Date(category.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
