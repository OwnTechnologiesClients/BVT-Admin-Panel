"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
import * as lessonContentAPI from "@/lib/api/lessonContent";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";
import { Video, FileText, Upload } from "lucide-react";

const LessonContentTable = () => {
  const router = useRouter();
  const [contents, setContents] = useState([]);
  const [allContents, setAllContents] = useState([]); // For accurate stats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const isInitialMount = useRef(true);
  const hasInitialFetch = useRef(false);

  // Fetch lesson contents with server-side pagination (Oasis pattern)
  const fetchLessonContents = useCallback(async (page, limit, search, contentType, options = {}) => {
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
        ...(contentType && { contentType })
      };
      
      const response = await lessonContentAPI.getAllLessonContents(params);
      if (response.success) {
        setContents(response.data || []);
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
      console.error('Error fetching lesson contents:', err);
      const errorMsg = err.message || 'Failed to fetch lesson contents';
      setError(errorMsg);
      showError('Error Loading Lesson Contents', errorMsg);
    } finally {
      if (!skipLoading) setLoading(false);
    }
  }, []);

  // Fetch all contents for accurate stats - only fetch once
  const fetchAllContents = async () => {
    try {
      const response = await lessonContentAPI.getAllLessonContents({ limit: 10000 });
      if (response.success) {
        setAllContents(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching all lesson contents:', err);
    }
  };

  // Initial fetch - only run once even in Strict Mode
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchLessonContents(1, 10, "", "");
    fetchAllContents();
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search change from DataTable
  const handleSearchChange = useCallback((search) => {
    setSearchTerm(search);
    fetchLessonContents(1, pagination.limit, search, filterType);
  }, [fetchLessonContents, pagination.limit, filterType]);

  // Handle filter change from DataTable
  const handleFilterChange = useCallback((filters) => {
    const newTypeFilter = filters.type || "";
    setFilterType(newTypeFilter);
    fetchLessonContents(1, pagination.limit, searchTerm, newTypeFilter);
  }, [fetchLessonContents, pagination.limit, searchTerm]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    fetchLessonContents(newPage, pagination.limit, searchTerm, filterType);
  }, [fetchLessonContents, pagination.limit, searchTerm, filterType]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    fetchLessonContents(1, newPageSize, searchTerm, filterType);
  }, [fetchLessonContents, searchTerm, filterType]);

  const handleDelete = async (content) => {
    const result = await showDeleteConfirm(
      'Delete Lesson Content?',
      'This action cannot be undone. All content data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      const response = await lessonContentAPI.deleteLessonContent(content.id);
      if (response.success) {
          showSuccess('Content Deleted!', 'The lesson content has been deleted successfully.');
        await fetchLessonContents(pagination.page, pagination.limit, searchTerm, filterType);
        } else {
          showError('Delete Failed', response.message || 'Failed to delete lesson content');
        }
      } catch (err) {
        showError('Error', err.message || 'Failed to delete lesson content');
      }
    }
  };

  const handleEdit = (content) => {
    router.push(`/lesson-content/${content.id}/edit`);
  };

  const handleView = (content) => {
    router.push(`/lesson-content/${content.id}/view`);
  };

  const handleAdd = () => {
    router.push('/lesson-content/add');
  };

  // Determine content type from video/document presence
  const getContentType = (content) => {
    const hasVideo = content.video && (content.video.filePath || content.video.fileName);
    const hasDocument = content.document && (content.document.filePath || content.document.fileName);
    
    if (hasVideo && hasDocument) return "mixed";
    if (hasVideo) return "video";
    if (hasDocument) return "document";
    return "none";
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format content data
  const formatContent = (content) => {
    const lesson = content.lessonId || {};
    const contentType = getContentType(content);
    
    return {
      id: content._id,
      title: content.title || 'Untitled',
      description: content.description || '',
      contentType: contentType,
      lessonId: lesson._id || lesson.id,
      lessonName: lesson.title || 'N/A',
      duration: formatDuration(content.duration),
      createdAt: content.createdAt,
      rawContent: content
    };
  };

  // Format contents for display
  const formattedContents = contents.map(formatContent);

  const columns = [
    {
      key: "title",
      label: "Content",
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
      key: "lessonName",
      label: "Lesson"
    },
    {
      key: "contentType",
      label: "Type",
      render: (value) => {
        const icons = {
          video: <Video className="w-4 h-4" />,
          document: <FileText className="w-4 h-4" />,
          mixed: <Upload className="w-4 h-4" />
        };
        const colors = {
          video: "info",
          document: "success",
          mixed: "warning"
        };
        return (
          <Badge color={colors[value] || "default"}>
            <div className="flex items-center gap-1">
              {icons[value] || <FileText className="w-4 h-4" />}
              <span className="capitalize">{value || "none"}</span>
            </div>
          </Badge>
        );
      }
    },
    {
      key: "duration",
      label: "Duration"
    }
  ];

  const filters = [
    {
      key: "type",
      label: "Content Type",
      options: ["video", "document", "mixed"]
    }
  ];

  const stats = [
    {
      label: "Total Content",
      value: pagination.total || contents.length,
      icon: "📄",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Videos",
      value: allContents.filter(c => {
        const type = getContentType(c);
        return type === "video" || type === "mixed";
      }).length,
      icon: "🎥",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      color: "text-purple-600"
    },
    {
      label: "Documents",
      value: allContents.filter(c => {
        const type = getContentType(c);
        return type === "document" || type === "mixed";
      }).length,
      icon: "📄",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      color: "text-green-600"
    }
  ];

  if (loading && contents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading lesson content...</p>
      </div>
    );
  }

  if (error && contents.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Lesson Content"
      data={formattedContents}
      columns={columns}
      searchPlaceholder="Search content..."
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

export default LessonContentTable;

