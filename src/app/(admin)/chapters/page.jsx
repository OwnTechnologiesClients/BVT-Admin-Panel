"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { Plus, Trash2, Edit, Eye, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import * as chapterAPI from "@/lib/api/chapter";
import * as courseAPI from "@/lib/api/course";
import * as lessonAPI from "@/lib/api/lesson";

export default function ChaptersPage() {
  const router = useRouter();
  const [chapters, setChapters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  // Fetch chapters
  const fetchChapters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chapterAPI.getAllChapters({ limit: 100 });
      if (response.success) {
        setChapters(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching chapters:', err);
      setError(err.message || 'Failed to fetch chapters');
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses for filter
  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses({ limit: 100 });
      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  // Fetch lessons to count per chapter
  const fetchLessons = async () => {
    try {
      const response = await lessonAPI.getAllLessons({ limit: 1000 });
      if (response.success) {
        const lessonsList = response.data?.lessons || response.data || [];
        setLessons(lessonsList);
      }
    } catch (err) {
      console.error('Error fetching lessons:', err);
    }
  };

  useEffect(() => {
    fetchChapters();
    fetchCourses();
    fetchLessons();
  }, []);

  const handleDelete = async (chapterId) => {
    if (!confirm("Are you sure you want to delete this chapter?")) {
      return;
    }

    try {
      const response = await chapterAPI.deleteChapter(chapterId);
      if (response.success) {
        await fetchChapters();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete chapter');
    }
  };

  // Format chapter data
  const formatChapter = (chapter) => {
    const course = chapter.courseId || {};
    // Count lessons for this chapter
    const lessonsCount = lessons.filter(
      lesson => lesson.chapterId?._id === chapter._id || lesson.chapterId === chapter._id
    ).length;
    
    return {
      id: chapter._id,
      title: chapter.title,
      description: chapter.description,
      isActive: chapter.isActive,
      courseId: course._id || course.id,
      courseName: course.title || 'N/A',
      duration: 'N/A', // Duration would need to be calculated from lessons
      lessonsCount: lessonsCount,
      createdAt: chapter.createdAt
    };
  };

  const formattedChapters = chapters.map(formatChapter);

  const filteredChapters = formattedChapters.filter(chapter => {
    const matchesSearch = chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chapter.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === "" || chapter.courseId === filterCourse;
    return matchesSearch && matchesCourse;
  });

  const courseOptions = [
    { value: "", label: "All Courses" },
    ...courses.map(course => ({
      value: course._id,
      label: course.title
    }))
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
    }

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Chapters Management"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Chapters", href: "/chapters" }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chapters Management</h2>
          <p className="text-gray-600">Manage course chapters and their content</p>
        </div>
        <Button
          onClick={() => router.push('/chapters/add')}
          className="flex items-center gap-2"
          variant="primary"
        >
          <Plus className="w-4 h-4" />
          Add Chapter
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="lg:w-64">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {courseOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Chapters</p>
              <p className="text-2xl font-bold text-gray-900">{formattedChapters.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Chapters</p>
              <p className="text-2xl font-bold text-green-600">
                {formattedChapters.filter(c => c.isActive).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900">
                {formattedChapters.reduce((sum, chapter) => sum + chapter.lessonsCount, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Duration</p>
              <p className="text-2xl font-bold text-gray-900">N/A</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 font-semibold">⏱️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Chapter</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Course</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Lessons</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChapters.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No chapters found
                  </td>
                </tr>
              ) : (
                filteredChapters.map((chapter) => (
                <tr key={chapter.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{chapter.title}</p>
                      <p className="text-sm text-gray-600">{chapter.description}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{chapter.courseName}</td>
                  <td className="py-4 px-4 text-gray-900">{chapter.lessonsCount}</td>
                  <td className="py-4 px-4">
                    <Badge color={chapter.isActive ? "success" : "error"}>
                      {chapter.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                        <Link href={`/chapters/${chapter.id}/view`}>
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </Button>
                        </Link>
                        <Link href={`/chapters/${chapter.id}/edit`}>
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </Button>
                        </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                          onClick={() => handleDelete(chapter.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
