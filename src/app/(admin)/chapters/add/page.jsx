"use client";

import React, { useState } from "react";
import { PageBreadcrumb } from "@/components/common";
import { Button } from "@/components/ui";
import { ArrowLeft, Save } from "lucide-react";

export default function AddChapterPage() {
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    order: 1,
    isActive: true
  });

  const [errors, setErrors] = useState({});

  const courses = [
    { id: 1, name: "Advanced Naval Engineering Workshop" },
    { id: 2, name: "Maritime Security Operations" },
    { id: 3, name: "Submarine Operations Masterclass" },
    { id: 4, name: "Marine Engineering Fundamentals" }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

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

    if (!formData.courseId) {
      newErrors.courseId = "Course is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Chapter title is required";
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
      console.log("Chapter submitted:", formData);
      // Handle form submission here
      alert("Chapter created successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Add Chapter"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Chapters", href: "/admin/chapters" },
          { label: "Add Chapter", href: "/admin/chapters/add" }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Chapters
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
                  Course *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => handleInputChange("courseId", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.courseId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter chapter title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange("order", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
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
                  rows={8}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter chapter description"
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
                  Active Chapter
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
              Create Chapter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
