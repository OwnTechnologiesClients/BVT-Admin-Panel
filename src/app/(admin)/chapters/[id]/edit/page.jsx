"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Button } from "@/components/ui";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import * as chapterAPI from "@/lib/api/chapter";
import * as courseAPI from "@/lib/api/course";

export default function EditChapterPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [chapter, setChapter] = useState({
    courseId: "",
    title: "",
    description: "",
    status: "active"
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch chapter
        const chapterResponse = await chapterAPI.getChapterById(id);
        if (chapterResponse.success) {
          const chapterData = chapterResponse.data;
          setChapter({
            courseId: chapterData.courseId?._id || chapterData.courseId || "",
            title: chapterData.title || "",
            description: chapterData.description || "",
            status: chapterData.isActive !== undefined ? (chapterData.isActive ? "active" : "inactive") : "active"
          });
        } else {
          setError('Chapter not found');
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

  const handleInputChange = (field, value) => {
    setChapter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!chapter.courseId || !chapter.title.trim() || !chapter.description.trim()) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await chapterAPI.updateChapter(id, {
        courseId: chapter.courseId,
        title: chapter.title.trim(),
        description: chapter.description.trim(),
        isActive: chapter.status === "active"
      });

      if (response.success) {
        router.push('/chapters');
      } else {
        alert(response.message || 'Failed to update chapter');
      }
    } catch (err) {
      alert(err.message || 'Failed to update chapter');
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
          pageTitle="Edit Chapter"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Chapters", href: "/chapters" },
            { label: "Edit Chapter", href: `/chapters/${id}/edit` }
          ]}
        />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-600">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/chapters')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chapters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Edit Chapter"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Chapters", href: "/chapters" },
          { label: "Edit Chapter", href: `/chapters/${id}/edit` }
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
          Back to Chapters
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
                  value={chapter.courseId}
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
                  Chapter Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={chapter.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter chapter title"
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={chapter.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter chapter description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <select
                  value={chapter.status}
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
                  Update Chapter
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
