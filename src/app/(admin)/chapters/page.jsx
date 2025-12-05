"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { Plus, Trash2, Edit, Eye, BookOpen, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import * as chapterAPI from "@/lib/api/chapter";
import * as courseAPI from "@/lib/api/course";
import * as lessonAPI from "@/lib/api/lesson";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";

export default function ChaptersPage() {
  const router = useRouter();
  const [chapters, setChapters] = useState([]);
  const [allChapters, setAllChapters] = useState([]); // For accurate stats
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const isInitialMount = useRef(true);
  const hasInitialFetch = useRef(false);

  // Fetch chapters with server-side pagination (Oasis pattern)
  const fetchChapters = useCallback(async (page, limit, search, courseId) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        sort_column: 'createdAt',
        sort_direction: 'desc',
        ...(search && { search }),
        ...(courseId && { courseId })
      };
      
      const response = await chapterAPI.getAllChapters(params);
      if (response.success) {
        setChapters(response.data || []);
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
      console.error('Error fetching chapters:', err);
      const errorMsg = err.message || 'Failed to fetch chapters';
      setError(errorMsg);
      showError('Error Loading Chapters', errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch courses for filter - only fetch once
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

  // Fetch all chapters for accurate stats - only fetch once
  const fetchAllChapters = async () => {
    try {
      const response = await chapterAPI.getAllChapters({ limit: 10000 });
      if (response.success) {
        setAllChapters(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching all chapters:', err);
    }
  };

  // Fetch lessons to count per chapter - only fetch once
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

  // Initial fetch - only run once even in Strict Mode
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchChapters(1, 10, "", "");
    fetchAllChapters();
    fetchCourses();
    fetchLessons();
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
      fetchChapters(1, pagination.limit, searchTerm, filterCourse);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchChapters, pagination.limit, filterCourse]);

  // Handle filter changes - trigger API call
  useEffect(() => {
    // Skip on initial mount - initial fetch already handles this
    if (isInitialMount.current) {
      return;
    }
    fetchChapters(1, pagination.limit, searchTerm, filterCourse);
  }, [filterCourse, fetchChapters, pagination.limit, searchTerm]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    fetchChapters(newPage, pagination.limit, searchTerm, filterCourse);
  }, [fetchChapters, pagination.limit, searchTerm, filterCourse]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    fetchChapters(1, newPageSize, searchTerm, filterCourse);
  }, [fetchChapters, searchTerm, filterCourse]);

  const handleDelete = async (chapterId) => {
    const result = await showDeleteConfirm(
      'Delete Chapter?',
      'This action cannot be undone. All chapter data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      const response = await chapterAPI.deleteChapter(chapterId);
      if (response.success) {
          showSuccess('Chapter Deleted!', 'The chapter has been deleted successfully.');
        await fetchChapters(pagination.page, pagination.limit, searchTerm, filterCourse);
        } else {
          showError('Delete Failed', response.message || 'Failed to delete chapter');
        }
      } catch (err) {
        showError('Error', err.message || 'Failed to delete chapter');
      }
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
      createdAt: chapter.createdAt,
      rawChapter: chapter // Keep original for filtering
    };
  };

  // Format chapters for display
  const formattedChapters = chapters.map(formatChapter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading chapters...</p>
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
      <div className="flex items-center justify-end">
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
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
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
              <p className="text-sm text-gray-600">Total Chapters</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total || chapters.length}</p>
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
                {allChapters.filter(c => c.isActive).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold">✓</span>
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
              {formattedChapters.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No chapters found
                  </td>
                </tr>
              ) : (
                formattedChapters.map((chapter) => (
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
