"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { Plus, Trash2, Edit, Eye, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import * as lessonAPI from "@/lib/api/lesson";
import * as chapterAPI from "@/lib/api/chapter";
import * as lessonContentAPI from "@/lib/api/lessonContent";

export default function LessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [lessonContents, setLessonContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChapter, setFilterChapter] = useState("");

  // Fetch lessons
  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await lessonAPI.getAllLessons({ limit: 100 });
      if (response.success) {
        setLessons(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching lessons:', err);
      setError(err.message || 'Failed to fetch lessons');
    } finally {
      setLoading(false);
    }
  };

  // Fetch chapters for filter
  const fetchChapters = async () => {
    try {
      const response = await chapterAPI.getAllChapters({ limit: 100 });
      if (response.success) {
        setChapters(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching chapters:', err);
    }
  };

  // Fetch lesson contents to count per lesson
  const fetchLessonContents = async () => {
    try {
      const response = await lessonContentAPI.getAllLessonContents({ limit: 1000 });
      if (response.success) {
        const contents = response.data?.lessonContents || response.data || [];
        setLessonContents(contents);
      }
    } catch (err) {
      console.error('Error fetching lesson contents:', err);
    }
  };

  useEffect(() => {
    fetchLessons();
    fetchChapters();
    fetchLessonContents();
  }, []);

  const handleDelete = async (lessonId) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    try {
      const response = await lessonAPI.deleteLesson(lessonId);
      if (response.success) {
        await fetchLessons();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete lesson');
    }
  };

  // Format lesson data
  const formatLesson = (lesson) => {
    const chapter = lesson.chapterId || {};
    const course = lesson.courseId || {};
    // Count content items for this lesson
    const contentCount = lessonContents.filter(
      content => content.lessonId?._id === lesson._id || content.lessonId === lesson._id
    ).length;
    
    return {
      id: lesson._id,
      title: lesson.title,
      description: lesson.description || '',
      isActive: lesson.isActive,
      isFree: lesson.isFree || false,
      chapterId: chapter._id || chapter.id,
      chapterName: chapter.title || 'N/A',
      courseId: course._id || course.id,
      courseName: course.title || 'N/A',
      duration: 'N/A', // Duration would need to be calculated from lesson content
      contentCount: contentCount,
      createdAt: lesson.createdAt
    };
  };

  const formattedLessons = lessons.map(formatLesson);

  const filteredLessons = formattedLessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChapter = filterChapter === "" || lesson.chapterId === filterChapter;
    return matchesSearch && matchesChapter;
  });

  const chapterOptions = [
    { value: "", label: "All Chapters" },
    ...chapters.map(chapter => ({
      value: chapter._id,
      label: chapter.title
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
        pageTitle="Lessons Management"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Lessons", href: "/lessons" }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lessons Management</h2>
          <p className="text-gray-600">Manage individual lessons and their content</p>
        </div>
        <Button
          onClick={() => router.push('/lessons/add')}
          className="flex items-center gap-2"
          variant="primary"
        >
          <Plus className="w-4 h-4" />
          Add Lesson
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
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="lg:w-48">
            <select
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {chapterOptions.map(option => (
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
              <p className="text-sm text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900">{formattedLessons.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Free Lessons</p>
              <p className="text-2xl font-bold text-green-600">
                {formattedLessons.filter(l => l.isFree).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold">🆓</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">
                {formattedLessons.reduce((sum, lesson) => sum + lesson.contentCount, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold">📁</span>
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

      {/* Lessons Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Lesson</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Chapter</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Content</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No lessons found
                  </td>
                </tr>
              ) : (
                filteredLessons.map((lesson) => (
                <tr key={lesson.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{lesson.title}</p>
                        {lesson.description && (
                      <p className="text-sm text-gray-600">{lesson.description}</p>
                        )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{lesson.chapterName}</td>
                  <td className="py-4 px-4 text-gray-900">{lesson.contentCount} items</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <Badge color={lesson.isActive ? "success" : "error"}>
                        {lesson.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {lesson.isFree && (
                        <Badge color="info">Free</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                        <Link href={`/lessons/${lesson.id}/view`}>
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </Button>
                        </Link>
                        <Link href={`/lessons/${lesson.id}/edit`}>
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </Button>
                        </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                          onClick={() => handleDelete(lesson.id)}
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
