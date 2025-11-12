"use client";

import React, { useState } from "react";
import { PageBreadcrumb } from "@/components/common";
import { Button } from "@/components/ui";
import { ArrowLeft, Save } from "lucide-react";

export default function AddCourseCategoryPage() {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true
  });

  const [errors, setErrors] = useState({});

  const parentCategories = [
    { id: "", name: "No Parent Category" },
    { id: 1, name: "Marine Engineering" },
    { id: 2, name: "Navigation" },
    { id: 3, name: "Maritime Safety" }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Category slug is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("Category submitted:", formData);
      // Handle form submission here
      alert("Category created successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Add Course Category"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Course Categories", href: "/admin/course-categories" },
          { label: "Add Category", href: "/admin/course-categories/add" }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter category name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.slug ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="category-slug"
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter category description"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange("isActive", e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active Category
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Create Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
