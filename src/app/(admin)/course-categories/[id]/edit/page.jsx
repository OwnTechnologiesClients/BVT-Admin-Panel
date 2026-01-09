"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Button } from "@/components/ui";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import * as categoryAPI from "@/lib/api/courseCategory";
import { showSuccess, showError } from "@/lib/utils/sweetalert";
import { getImageUrl } from "@/lib/utils/urlHelpers";

export default function EditCategoryPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: null,
    status: "active"
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await categoryAPI.getCategoryById(id);
        if (response.success) {
          setFormData({
            name: response.data.name || "",
            slug: response.data.slug || "",
            description: response.data.description || "",
            image: response.data.image || null,
            status: response.data.isActive !== undefined ? (response.data.isActive ? "active" : "inactive") : "active"
          });
        } else {
          const errorMsg = 'Category not found';
          setError(errorMsg);
          showError('Error', errorMsg);
        }
      } catch (err) {
        const errorMsg = err.message || 'Failed to fetch category';
        setError(errorMsg);
        showError('Error', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Check if there's a new image file to upload
      const hasImageUpload = formData.image !== null && formData.image instanceof File;
      
      let response;
      if (hasImageUpload) {
        // Use FormData if there's a new image file
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name.trim());
        formDataToSend.append('slug', formData.slug.trim());
        formDataToSend.append('description', formData.description.trim());
        formDataToSend.append('isActive', formData.status === "active");
        formDataToSend.append('image', formData.image);
        
        response = await categoryAPI.updateCategory(id, formDataToSend);
      } else {
        // Use plain object if no new image (keep existing or set to null)
        response = await categoryAPI.updateCategory(id, {
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim(),
          image: formData.image || null,
          isActive: formData.status === "active"
        });
      }

      if (response.success) {
        showSuccess('Category Updated!', 'The category has been updated successfully.');
        setTimeout(() => {
          router.push('/course-categories');
        }, 1500);
      } else {
        showError('Error', response.message || 'Failed to update category');
      }
    } catch (err) {
      showError('Error', err.message || 'Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb 
          pageTitle="Edit Course Category"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Course Categories", href: "/course-categories" },
            { label: "Edit Category", href: `/course-categories/${id}/edit` }
          ]}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Edit Course Category"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Course Categories", href: "/course-categories" },
          { label: "Edit Category", href: `/course-categories/${id}/edit` }
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
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
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
                  Category Slug <span className="text-red-500">*</span>
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

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                {formData.image ? (
                  <div className="relative group">
                    <img
                      src={formData.image instanceof File ? URL.createObjectURL(formData.image) : getImageUrl(formData.image)}
                      alt="Category preview"
                      className="rounded-lg border border-gray-200 max-h-48 w-full object-cover shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleInputChange("image", null)}
                      className="absolute top-2 right-2 bg-white hover:bg-red-100 rounded-full p-2 text-red-600 border border-red-200 shadow"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer bg-white border border-dashed border-gray-300 rounded-lg px-6 py-8 min-h-[150px] flex flex-col items-center justify-center text-center text-gray-500 hover:border-blue-400 transition-all">
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="font-medium">Click to upload category image</span>
                    <span className="text-xs text-gray-400 mt-1">JPG, PNG, GIF. Max size: 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleInputChange("image", e.target.files[0] || null)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push('/course-categories')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="flex items-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Category
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
