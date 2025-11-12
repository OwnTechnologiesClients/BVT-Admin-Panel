"use client";

import React, { useState } from "react";
import { PageBreadcrumb } from "@/components/common";
import { Button } from "@/components/ui";
import { ArrowLeft, Save } from "lucide-react";

export default function AddLessonPage() {
  const [formData, setFormData] = useState({
    courseId: "",
    chapterId: "",
    title: "",
    order: 1,
    isActive: true,
    isFree: false
  });

  const [errors, setErrors] = useState({});

  // Courses data
  const courses = [
    { id: 1, name: "Advanced Naval Engineering Workshop" },
    { id: 2, name: "Maritime Security Operations" },
    { id: 3, name: "Submarine Operations Masterclass" }
  ];

  // Chapters data with course reference
  const chapters = [
    { id: 1, name: "Getting Started", courseId: 1 },
    { id: 2, name: "Ship Propulsion Systems", courseId: 1 },
    { id: 3, name: "Advanced Propulsion", courseId: 1 },
    { id: 4, name: "Security Fundamentals", courseId: 2 },
    { id: 5, name: "Threat Assessment", courseId: 2 },
    { id: 6, name: "Introduction to Submarines", courseId: 3 },
    { id: 7, name: "Underwater Navigation", courseId: 3 }
  ];

  // Filter chapters based on selected course
  const filteredChapters = formData.courseId 
    ? chapters.filter(chapter => chapter.courseId === parseInt(formData.courseId))
    : [];

  const lessonTypes = [
    { value: "lecture", label: "Lecture" },
    { value: "practical", label: "Practical" },
    { value: "workshop", label: "Workshop" },
    { value: "assessment", label: "Assessment" }
  ];

  const handleInputChange = (field, value) => {
    // Reset chapter selection when course changes
    if (field === "courseId") {
      setFormData(prev => ({
        ...prev,
        courseId: value,
        chapterId: "" // Reset chapter selection
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
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

    if (!formData.courseId) {
      newErrors.courseId = "Course is required";
    }

    if (!formData.chapterId) {
      newErrors.chapterId = "Chapter is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Lesson title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("Lesson submitted:", formData);
      // Handle form submission here
      alert("Lesson created successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Add Lesson"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Lessons", href: "/admin/lessons" },
          { label: "Add Lesson", href: "/admin/lessons/add" }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Lessons
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
                  Chapter *
                </label>
                <select
                  value={formData.chapterId}
                  onChange={(e) => handleInputChange("chapterId", e.target.value)}
                  disabled={!formData.courseId}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.chapterId ? "border-red-500" : "border-gray-300"
                  } ${!formData.courseId ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {formData.courseId ? "Select a chapter" : "Select a course first"}
                  </option>
                  {filteredChapters.map(chapter => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
                {errors.chapterId && <p className="text-red-500 text-sm mt-1">{errors.chapterId}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter lesson title"
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

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange("isActive", e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active Lesson
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={formData.isFree}
                    onChange={(e) => handleInputChange("isFree", e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isFree" className="text-sm font-medium text-gray-700">
                    Free Lesson
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
              Create Lesson
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
