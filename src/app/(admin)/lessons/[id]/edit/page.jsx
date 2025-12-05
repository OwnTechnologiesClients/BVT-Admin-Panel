"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Button } from "@/components/ui";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import * as lessonAPI from "@/lib/api/lesson";
import * as courseAPI from "@/lib/api/course";
import * as chapterAPI from "@/lib/api/chapter";
import { showSuccess, showError } from "@/lib/utils/sweetalert";

export default function EditLessonPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [lesson, setLesson] = useState({
    courseId: "",
    chapterId: "",
    title: "",
    description: "",
    status: "active",
    isFree: false
  });
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch lesson
        const lessonResponse = await lessonAPI.getLessonById(id);
        if (lessonResponse.success) {
          const lessonData = lessonResponse.data;
          setLesson({
            courseId: lessonData.courseId?._id || lessonData.courseId || "",
            chapterId: lessonData.chapterId?._id || lessonData.chapterId || "",
            title: lessonData.title || "",
            description: lessonData.description || "",
            status: lessonData.isActive !== undefined ? (lessonData.isActive ? "active" : "inactive") : "active",
            isFree: lessonData.isFree || false
          });
        } else {
          setError('Lesson not found');
        }

        // Fetch courses
        const coursesResponse = await courseAPI.getAllCourses({ limit: 100 });
        if (coursesResponse.success) {
          setCourses(coursesResponse.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Fetch chapters when course is selected
  useEffect(() => {
    const fetchChapters = async () => {
      if (!lesson.courseId) {
        setChapters([]);
        return;
      }

      try {
        const response = await chapterAPI.getChaptersByCourse(lesson.courseId);
        if (response.success) {
          setChapters(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching chapters:', err);
        setChapters([]);
      }
    };

    fetchChapters();
  }, [lesson.courseId]);

  const handleInputChange = (field, value) => {
    // Reset chapter selection when course changes
    if (field === "courseId") {
      setLesson(prev => ({
        ...prev,
        courseId: value,
        chapterId: "" // Reset chapter selection
      }));
    } else {
      setLesson(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    if (!lesson.courseId || !lesson.chapterId || !lesson.title.trim()) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await lessonAPI.updateLesson(id, {
        courseId: lesson.courseId,
        chapterId: lesson.chapterId,
        title: lesson.title.trim(),
        description: lesson.description?.trim() || "",
        isActive: lesson.status === "active",
        isFree: lesson.isFree
      });

      if (response.success) {
        showSuccess('Lesson Updated!', 'The lesson has been updated successfully.');
        setTimeout(() => {
        router.push('/lessons');
        }, 1500);
      } else {
        showError('Error', response.message || 'Failed to update lesson');
      }
    } catch (err) {
      showError('Error', err.message || 'Failed to update lesson');
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
          pageTitle="Edit Lesson"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Lessons", href: "/lessons" },
            { label: "Edit Lesson", href: `/lessons/${id}/edit` }
          ]}
        />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-600">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/lessons')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Edit Lesson"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Lessons", href: "/lessons" },
          { label: "Edit Lesson", href: `/lessons/${id}/edit` }
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
                <select
                  value={lesson.courseId}
                  onChange={(e) => handleInputChange("courseId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter <span className="text-red-500">*</span>
                </label>
                <select
                  value={lesson.chapterId}
                  onChange={(e) => handleInputChange("chapterId", e.target.value)}
                  disabled={!lesson.courseId}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !lesson.courseId ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">
                    {lesson.courseId ? "Select a chapter" : "Select a course first"}
                  </option>
                  {chapters.map(chapter => (
                    <option key={chapter._id} value={chapter._id}>
                      {chapter.title}
                    </option>
                  ))}
                </select>
                {lesson.courseId && chapters.length === 0 && (
                  <p className="text-gray-500 text-sm mt-1">No chapters available for this course</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lesson.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter lesson title"
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <textarea
                  value={lesson.description}
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
                    value={lesson.status}
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
                    checked={lesson.isFree}
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Lesson
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
