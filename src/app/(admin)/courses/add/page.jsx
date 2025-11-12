"use client";

import React, { useState } from "react";
import { PageBreadcrumb } from "@/components/common";
import { Button } from "@/components/ui";
import { ArrowLeft, Save } from "lucide-react";

export default function AddCoursePage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    instructorId: "",
    duration: "",
    maxStudents: "",
    isOnline: true,
    price: "",
    difficulty: "beginner",
    prerequisites: "",
    learningObjectives: "",
    isActive: true
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { id: 1, name: "Marine Engineering" },
    { id: 2, name: "Navigation" },
    { id: 3, name: "Maritime Safety" },
    { id: 4, name: "Naval Operations" }
  ];

  const instructors = [
    { id: 1, name: "Captain John Smith" },
    { id: 2, name: "Commander Sarah Johnson" },
    { id: 3, name: "Lieutenant Mike Davis" },
    { id: 4, name: "Chief Engineer Lisa Brown" }
  ];

  const difficulties = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "expert", label: "Expert" }
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

    if (!formData.title.trim()) {
      newErrors.title = "Course title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (!formData.instructorId) {
      newErrors.instructorId = "Instructor is required";
    }

    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    }

    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("Course submitted:", formData);
      // Handle form submission here
      alert("Course created successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Add New Course"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Courses", href: "/admin/courses" },
          { label: "Add Course", href: "/admin/courses/add" }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
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
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter course title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange("categoryId", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.categoryId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor *
                </label>
                <select
                  value={formData.instructorId}
                  onChange={(e) => handleInputChange("instructorId", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.instructorId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select an instructor</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
                {errors.instructorId && <p className="text-red-500 text-sm mt-1">{errors.instructorId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.duration ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., 4 weeks, 40 hours"
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Students
                </label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => handleInputChange("maxStudents", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="299.99"
                  min="0"
                  step="0.01"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange("difficulty", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
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
                  placeholder="Enter course description"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prerequisites
                </label>
                <textarea
                  value={formData.prerequisites}
                  onChange={(e) => handleInputChange("prerequisites", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="List any prerequisites..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Objectives
                </label>
                <textarea
                  value={formData.learningObjectives}
                  onChange={(e) => handleInputChange("learningObjectives", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What will students learn..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isOnline"
                    checked={formData.isOnline}
                    onChange={(e) => handleInputChange("isOnline", e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isOnline" className="text-sm font-medium text-gray-700">
                    Online Course
                  </label>
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
                    Active Course
                  </label>
                </div>
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
              Create Course
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}