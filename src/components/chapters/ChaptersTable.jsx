"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
import * as chapterAPI from "@/lib/api/chapter";
import * as courseAPI from "@/lib/api/course";
import * as lessonAPI from "@/lib/api/lesson";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";

const ChaptersTable = () => {
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
  const fetchChapters = useCallback(async (page, limit, search, courseId, options = {}) => {
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
      if (!skipLoading) setLoading(false);
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
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search change from DataTable
  const handleSearchChange = useCallback((search) => {
    setSearchTerm(search);
    fetchChapters(1, pagination.limit, search, filterCourse);
  }, [fetchChapters, pagination.limit, filterCourse]);

  // Handle filter change from DataTable
  const handleFilterChange = useCallback((filters) => {
    const courseTitle = filters.course || "";
    // Map course title back to ID
    const course = courses.find(c => c.title === courseTitle);
    const newCourseFilter = course ? course._id : "";
    setFilterCourse(newCourseFilter);
    fetchChapters(1, pagination.limit, searchTerm, newCourseFilter);
  }, [fetchChapters, pagination.limit, searchTerm, courses]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    fetchChapters(newPage, pagination.limit, searchTerm, filterCourse);
  }, [fetchChapters, pagination.limit, searchTerm, filterCourse]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    fetchChapters(1, newPageSize, searchTerm, filterCourse);
  }, [fetchChapters, searchTerm, filterCourse]);

  const handleDelete = async (chapter) => {
    const result = await showDeleteConfirm(
      'Delete Chapter?',
      'This action cannot be undone. All chapter data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      const response = await chapterAPI.deleteChapter(chapter.id);
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

  const handleEdit = (chapter) => {
    router.push(`/chapters/${chapter.id}/edit`);
  };

  const handleView = (chapter) => {
    router.push(`/chapters/${chapter.id}/view`);
  };

  const handleAdd = () => {
    router.push('/chapters/add');
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
      duration: 'N/A',
      lessonsCount: lessonsCount,
      createdAt: chapter.createdAt,
      rawChapter: chapter
    };
  };

  // Format chapters for display
  const formattedChapters = chapters.map(formatChapter);

  const columns = [
    {
      key: "title",
      label: "Chapter",
      render: (value, item) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>
      )
    },
    {
      key: "courseName",
      label: "Course"
    },
    {
      key: "lessonsCount",
      label: "Lessons"
    },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <Badge color={value ? "success" : "error"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      )
    }
  ];

  const filters = [
    {
      key: "course",
      label: "Course",
      options: courses.map(c => c.title)
    }
  ];

  const stats = [
    {
      label: "Total Chapters",
      value: pagination.total || chapters.length,
      icon: "📚",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Active Chapters",
      value: allChapters.filter(c => c.isActive).length,
      icon: "✓",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      color: "text-green-600"
    }
  ];

  if (loading && chapters.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading chapters...</p>
      </div>
    );
  }

  if (error && chapters.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Chapters"
      data={formattedChapters}
      columns={columns}
      searchPlaceholder="Search chapters..."
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

export default ChaptersTable;

