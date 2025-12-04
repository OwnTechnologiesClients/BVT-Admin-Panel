"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { Plus, Trash2, Edit, Eye, BookOpen, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import * as lessonAPI from "@/lib/api/lesson";
import * as chapterAPI from "@/lib/api/chapter";
import * as lessonContentAPI from "@/lib/api/lessonContent";

export default function LessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState([]);
  const [allLessons, setAllLessons] = useState([]); // For accurate stats
  const [chapters, setChapters] = useState([]);
  const [lessonContents, setLessonContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const isInitialMount = useRef(true);
  const hasInitialFetch = useRef(false);

  // Fetch lessons with server-side pagination (Oasis pattern)
  const fetchLessons = useCallback(async (page, limit, search, chapterId) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        sort_column: 'createdAt',
        sort_direction: 'desc',
        ...(search && { search }),
        ...(chapterId && { chapterId })
      };
      
      const response = await lessonAPI.getAllLessons(params);
      if (response.success) {
        setLessons(response.data || []);
        if (response.pagination) {
          setPagination({
            page: response.pagination.page || page,
            limit: response.pagination.limit || limit,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0
          });
        }
      }
    } catch (err) {
      console.error('Error fetching lessons:', err);
      setError(err.message || 'Failed to fetch lessons');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch chapters for filter - only fetch once
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

  // Fetch all lessons for accurate stats - only fetch once
  const fetchAllLessons = async () => {
    try {
      const response = await lessonAPI.getAllLessons({ limit: 10000 });
      if (response.success) {
        setAllLessons(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching all lessons:', err);
    }
  };

  // Fetch lesson contents to count per lesson - only fetch once
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

  // Initial fetch - only run once even in Strict Mode
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchLessons(1, 10, "", "");
    fetchAllLessons();
    fetchChapters();
    fetchLessonContents();
    // Mark initial mount as complete after a short delay to allow other effects to skip
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search (300ms like Oasis)
  const searchTimeoutRef = useRef(null);
  useEffect(() => {
    // Skip on initial mount - initial fetch already handles this
    if (isInitialMount.current) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchLessons(1, pagination.limit, searchTerm, filterChapter);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchLessons, pagination.limit, filterChapter]);

  // Handle filter changes - trigger API call
  useEffect(() => {
    // Skip on initial mount - initial fetch already handles this
    if (isInitialMount.current) {
      return;
    }
    fetchLessons(1, pagination.limit, searchTerm, filterChapter);
  }, [filterChapter, fetchLessons, pagination.limit, searchTerm]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    fetchLessons(newPage, pagination.limit, searchTerm, filterChapter);
  }, [fetchLessons, pagination.limit, searchTerm, filterChapter]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    fetchLessons(1, newPageSize, searchTerm, filterChapter);
  }, [fetchLessons, searchTerm, filterChapter]);

  const handleDelete = async (lessonId) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    try {
      const response = await lessonAPI.deleteLesson(lessonId);
      if (response.success) {
        await fetchLessons(pagination.page, pagination.limit, searchTerm, filterChapter);
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
      createdAt: lesson.createdAt,
      rawLesson: lesson // Keep original for filtering
    };
  };

  // Format lessons for display
  const formattedLessons = lessons.map(formatLesson);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading lessons...</p>
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
      <div className="flex items-center justify-end">
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
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Chapters</option>
              {chapters.map(chapter => (
                <option key={chapter._id} value={chapter._id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total || lessons.length}</p>
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
                {allLessons.filter(l => l.isFree).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold">🆓</span>
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
              {formattedLessons.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No lessons found
                  </td>
                </tr>
              ) : (
                formattedLessons.map((lesson) => (
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

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
                  <span className="font-medium">{pagination.total}</span> items
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Show:</label>
                  <select
                    value={pagination.limit}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="min-w-[2.5rem]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
