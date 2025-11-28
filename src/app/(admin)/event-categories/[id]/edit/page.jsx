"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Button } from "@/components/ui";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import * as categoryAPI from "@/lib/api/eventCategory";

export default function EditEventCategoryPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    whatToExpect: "",
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
            whatToExpect: Array.isArray(response.data.whatToExpect) 
              ? response.data.whatToExpect.join(", ") 
              : response.data.whatToExpect || "",
            status: response.data.isActive !== undefined ? (response.data.isActive ? "active" : "inactive") : "active"
          });
        } else {
          setError('Theme not found');
        }
      } catch (err) {
        console.error('Error fetching category:', err);
        setError(err.message || 'Failed to fetch theme');
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
      newErrors.name = "Theme name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Theme slug is required";
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
      const response = await categoryAPI.updateCategory(id, {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        whatToExpect: formData.whatToExpect.trim() || undefined,
        isActive: formData.status === "active"
      });

      if (response.success) {
        router.push('/event-categories');
      } else {
        alert(response.message || 'Failed to update theme');
      }
    } catch (err) {
      alert(err.message || 'Failed to update theme');
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
          pageTitle="Edit Event Theme"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Event Themes", href: "/event-categories" },
            { label: "Edit Theme", href: `/event-categories/${id}/edit` }
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
        pageTitle="Edit Event Theme"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Event Themes", href: "/event-categories" },
          { label: "Edit Theme", href: `/event-categories/${id}/edit` }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push('/event-categories')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Themes
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
                  Theme Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter theme name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.slug ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="theme-slug"
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
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
                  placeholder="Enter theme description"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What to Expect <span className="text-gray-400 text-xs">(optional, comma-separated)</span>
                </label>
                <textarea
                  value={formData.whatToExpect}
                  onChange={(e) => handleInputChange("whatToExpect", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Keynote Speakers, Panel Discussions, Networking Sessions, Exhibition Hall"
                />
                <p className="text-xs text-gray-500 mt-1">Enter items separated by commas. These will be displayed as bullet points.</p>
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
              onClick={() => router.push('/event-categories')}
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
                  Update Theme
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

