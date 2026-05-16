"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
import * as lessonAPI from "@/lib/api/lesson";
import * as chapterAPI from "@/lib/api/chapter";
import * as lessonContentAPI from "@/lib/api/lessonContent";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";

const LessonsTable = () => {
  const router = useRouter();
  const [lessons, setLessons] = useState([]);
  const [lessonStats, setLessonStats] = useState({ freeLessons: 0 });
  const [chapters, setChapters] = useState([]);
  const [contentCountsByLesson, setContentCountsByLesson] = useState({});
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
  const fetchLessons = useCallback(async (page, limit, search, chapterId, options = {}) => {
    const { skipLoading = false } = options;
    try {
      if (!skipLoading) setLoading(true);
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
      const errorMsg = err.message || 'Failed to fetch lessons';
      setError(errorMsg);
      showError('Error Loading Lessons', errorMsg);
    } finally {
      if (!skipLoading) setLoading(false);
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

  const fetchLessonStats = async () => {
    try {
      const response = await lessonAPI.getLessonStats();
      if (response.success && response.data) {
        setLessonStats({ freeLessons: response.data.freeLessons ?? 0 });
      }
    } catch (err) {
      console.error('Error fetching lesson stats:', err);
    }
  };

  // Per-lesson content counts (aggregation — accurate for all lessons)
  const fetchLessonContentCounts = async () => {
    try {
      const response = await lessonContentAPI.getLessonContentCountsByLesson();
      if (response.success) {
        const list = response.data || [];
        const map = {};
        for (const row of list) {
          if (row.lessonId) map[String(row.lessonId)] = row.count;
        }
        setContentCountsByLesson(map);
      }
    } catch (err) {
      console.error('Error fetching lesson content counts:', err);
    }
  };

  // Initial fetch - only run once even in Strict Mode
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchLessons(1, 10, "", "");
    fetchLessonStats();
    fetchChapters();
    fetchLessonContentCounts();
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search change from DataTable
  const handleSearchChange = useCallback((search) => {
    setSearchTerm(search);
    fetchLessons(1, pagination.limit, search, filterChapter);
  }, [fetchLessons, pagination.limit, filterChapter]);

  // Handle filter change from DataTable
  const handleFilterChange = useCallback((filters) => {
    const chapterTitle = filters.chapter || "";
    // Map chapter title back to ID
    const chapter = chapters.find(c => c.title === chapterTitle);
    const newChapterFilter = chapter ? chapter._id : "";
    setFilterChapter(newChapterFilter);
    fetchLessons(1, pagination.limit, searchTerm, newChapterFilter);
  }, [fetchLessons, pagination.limit, searchTerm, chapters]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    fetchLessons(newPage, pagination.limit, searchTerm, filterChapter);
  }, [fetchLessons, pagination.limit, searchTerm, filterChapter]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    fetchLessons(1, newPageSize, searchTerm, filterChapter);
  }, [fetchLessons, searchTerm, filterChapter]);

  const handleDelete = async (lesson) => {
    const result = await showDeleteConfirm(
      'Delete Lesson?',
      'This action cannot be undone. All lesson data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
      try {
        const response = await lessonAPI.deleteLesson(lesson.id);
        if (response.success) {
          showSuccess('Lesson Deleted!', 'The lesson has been deleted successfully.');
          await fetchLessons(pagination.page, pagination.limit, searchTerm, filterChapter);
          await fetchLessonContentCounts();
        } else {
          showError('Delete Failed', response.message || 'Failed to delete lesson');
        }
      } catch (err) {
        showError('Error', err.message || 'Failed to delete lesson');
      }
    }
  };

  const handleEdit = (lesson) => {
    router.push(`/lessons/${lesson.id}/edit`);
  };

  const handleView = (lesson) => {
    router.push(`/lessons/${lesson.id}/view`);
  };

  const handleAdd = () => {
    router.push('/lessons/add');
  };

  // Format lesson data
  const formatLesson = (lesson) => {
    const chapter = lesson.chapterId || {};
    const course = lesson.courseId || {};
    const lessonIdStr = lesson._id ? String(lesson._id) : '';
    const contentCount = contentCountsByLesson[lessonIdStr] ?? 0;
    
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
      duration: 'N/A',
      contentCount: contentCount,
      createdAt: lesson.createdAt,
      rawLesson: lesson
    };
  };

  // Format lessons for display
  const formattedLessons = lessons.map(formatLesson);

  const columns = [
    {
      key: "title",
      label: "Lesson",
      render: (value, item) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          {item.description && (
            <p className="text-sm text-gray-600">{item.description}</p>
          )}
        </div>
      )
    },
    {
      key: "chapterName",
      label: "Chapter"
    },
    {
      key: "contentCount",
      label: "Content",
      render: (value) => <span>{value} items</span>
    },
    {
      key: "isActive",
      label: "Status",
      render: (value, item) => (
        <div className="flex flex-col gap-1">
          <Badge color={value ? "success" : "error"}>
            {value ? "Active" : "Inactive"}
          </Badge>
          {item.isFree && (
            <Badge color="info">Free</Badge>
          )}
        </div>
      )
    }
  ];

  const filters = [];

  const stats = [
    {
      label: "Total Lessons",
      value: pagination.total || lessons.length,
      icon: "📚",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Free Lessons",
      value: lessonStats.freeLessons,
      icon: "🆓",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      color: "text-green-600"
    }
  ];

  if (loading && lessons.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading lessons...</p>
      </div>
    );
  }

  if (error && lessons.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Lessons"
      data={formattedLessons}
      columns={columns}
      searchPlaceholder="Search lessons..."
      filters={filters}
      stats={stats}
      pagination={pagination}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearchChange={handleSearchChange}
      onFilterChange={handleFilterChange}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      serverSide={true}
    />
  );
};

export default LessonsTable;

