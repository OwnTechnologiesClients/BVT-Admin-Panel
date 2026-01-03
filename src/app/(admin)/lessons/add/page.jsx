"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Button, SearchableSelect } from "@/components/ui";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import * as courseAPI from "@/lib/api/course";
import * as chapterAPI from "@/lib/api/chapter";
import * as lessonAPI from "@/lib/api/lesson";
import { showSuccess, showError } from "@/lib/utils/sweetalert";

export default function AddLessonPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    courseId: "",
    chapterId: "",
    title: "",
    description: "",
    status: "active",
    isFree: false
  });

  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getAllCourses({ limit: 100 });
        if (response.success) {
          setCourses(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch chapters when course is selected
  useEffect(() => {
    const fetchChapters = async () => {
      if (!formData.courseId) {
        setChapters([]);
        return;
      }

      try {
        const response = await chapterAPI.getChaptersByCourse(formData.courseId);
        if (response.success) {
          setChapters(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching chapters:', err);
        setChapters([]);
      }
    };

    fetchChapters();
  }, [formData.courseId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await lessonAPI.createLesson({
        courseId: formData.courseId,
        chapterId: formData.chapterId,
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        isActive: formData.status === "active",
        isFree: formData.isFree
      });

      if (response.success) {
        showSuccess('Lesson Created!', 'The lesson has been created successfully.');
        setTimeout(() => {
        router.push('/lessons');
        }, 1500);
      } else {
        showError('Error', response.message || 'Failed to create lesson');
      }
    } catch (err) {
      showError('Error', err.message || 'Failed to create lesson');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Add Lesson"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Lessons", href: "/lessons" },
          { label: "Add Lesson", href: "/lessons/add" }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lessons
        </Button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  value={formData.courseId}
                  onChange={(value) => handleInputChange("courseId", value)}
                  options={courses}
                  placeholder="Select a course"
                  displayKey="title"
                  valueKey="_id"
                  required={true}
                  error={errors.courseId}
                />
                {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  value={formData.chapterId}
                  onChange={(value) => handleInputChange("chapterId", value)}
                  options={chapters}
                  placeholder={formData.courseId ? "Select a chapter" : "Select a course first"}
                  displayKey="title"
                  valueKey="_id"
                  required={true}
                  disabled={!formData.courseId}
                  error={errors.chapterId}
                  emptyMessage={formData.courseId && chapters.length === 0 ? "No chapters available for this course" : "No options found"}
                />
                {errors.chapterId && <p className="text-red-500 text-sm mt-1">{errors.chapterId}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Title <span className="text-red-500">*</span>
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
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter lesson description (optional)"
                  />
                </div>

              <div className="space-y-4">
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

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={formData.isFree}
                    onChange={(e) => handleInputChange("isFree", e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isFree" className="text-sm font-medium text-gray-700">
                    Free Lesson <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
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
                    Creating...
                  </>
                ) : (
                  <>
              <Save className="w-4 h-4" />
              Create Lesson
                  </>
                )}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
