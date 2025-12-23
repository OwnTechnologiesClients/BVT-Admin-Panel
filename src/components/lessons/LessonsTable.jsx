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

  const filters = [
    {
      key: "chapter",
      label: "Chapter",
      options: chapters.map(c => c.title)
    }
  ];

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
      value: allLessons.filter(l => l.isFree).length,
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

