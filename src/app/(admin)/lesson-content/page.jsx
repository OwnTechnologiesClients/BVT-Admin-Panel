"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { Plus, Trash2, Edit, Eye, Video, FileText, Upload, Search, Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import * as lessonContentAPI from "@/lib/api/lessonContent";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";

export default function LessonContentPage() {
  const router = useRouter();
  const [contents, setContents] = useState([]);
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
  const [deletingId, setDeletingId] = useState(null);
  const isInitialMount = useRef(true);
  const hasInitialFetch = useRef(false);

  // Fetch lesson contents with server-side pagination (Oasis pattern)
  // Supports lightweight search without triggering full table loading state
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
      } else {
        setError(response.message || 'Failed to fetch lesson contents');
      }
    } catch (err) {
      console.error('Error fetching lesson contents:', err);
      setError(err.message || 'Failed to fetch lesson contents');
    } finally {
      if (!skipLoading) setLoading(false);
    }
  }, []);

  // Initial fetch - only run once even in Strict Mode
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchLessonContents(1, 10, "", "");
    // Mark initial mount as complete after a short delay to allow other effects to skip
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Explicit search trigger (type + Enter or button)
  const handleSearch = useCallback(() => {
    // Always reset to first page when searching
    fetchLessonContents(1, pagination.limit, searchTerm, filterType);
  }, [fetchLessonContents, pagination.limit, searchTerm, filterType]);

  // Handle filter changes - trigger API call immediately (not search)
  const prevFiltersRef = useRef({ filterType });
  useEffect(() => {
    // Skip on initial mount - initial fetch already handles this
    if (isInitialMount.current) {
      return;
    }

    // Only trigger if filters actually changed (not search)
    if (prevFiltersRef.current.filterType !== filterType) {
      prevFiltersRef.current = { filterType };
      fetchLessonContents(1, pagination.limit, searchTerm, filterType);
    }
  }, [filterType, fetchLessonContents, pagination.limit, searchTerm]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    fetchLessonContents(newPage, pagination.limit, searchTerm, filterType);
  }, [fetchLessonContents, pagination.limit, searchTerm, filterType]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    fetchLessonContents(1, newPageSize, searchTerm, filterType);
  }, [fetchLessonContents, searchTerm, filterType]);

  // Determine content type from video/document presence
  const getContentType = (content) => {
    const hasVideo = content.video && (content.video.filePath || content.video.fileName);
    const hasDocument = content.document && (content.document.filePath || content.document.fileName);
    
    if (hasVideo && hasDocument) return "mixed";
    if (hasVideo) return "video";
    if (hasDocument) return "document";
    return "none";
  };

  // Format contents for display (with content type)
  const formattedContents = contents.map(content => ({
    ...content,
    contentType: getContentType(content)
  }));

  const handleDelete = async (contentId) => {
    const result = await showDeleteConfirm(
      'Delete Lesson Content?',
      'This action cannot be undone. All content data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      setDeletingId(contentId);
      const response = await lessonContentAPI.deleteLessonContent(contentId);
      if (response.success) {
          showSuccess('Content Deleted!', 'The lesson content has been deleted successfully.');
        // Refresh current page
        await fetchLessonContents(pagination.page, pagination.limit, searchTerm, filterType);
      } else {
          showError('Delete Failed', response.message || 'Failed to delete lesson content');
      }
    } catch (err) {
      console.error('Error deleting lesson content:', err);
        showError('Error', err.message || 'Failed to delete lesson content');
    } finally {
      setDeletingId(null);
      }
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4" />;
      case "document": return <FileText className="w-4 h-4" />;
      case "mixed": return <Upload className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case "video": return "info";
      case "document": return "success";
      case "mixed": return "warning";
      default: return "default";
    }
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb 
          pageTitle="Lesson Content Management"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Lesson Content", href: "/lesson-content" }
          ]}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Loading lesson content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb 
          pageTitle="Lesson Content Management"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Lesson Content", href: "/lesson-content" }
          ]}
        />
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" onClick={() => fetchLessonContents(1, 10, "", "")} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Lesson Content Management"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Lesson Content", href: "/lesson-content" }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-end">
        <Button
          onClick={() => router.push('/lesson-content/add')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Content
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
            <option value="">All Types</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
            <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total || contents.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Videos</p>
              <p className="text-2xl font-bold text-blue-600">
                {formattedContents.filter(c => {
                  const type = c.contentType;
                  return type === "video" || type === "mixed";
                }).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Video className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-green-600">
                {formattedContents.filter(c => {
                  const type = c.contentType;
                  return type === "document" || type === "mixed";
                }).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Required</p>
              <p className="text-2xl font-bold text-purple-600">
                {formattedContents.filter(c => c.isRequired).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold">📌</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {formattedContents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No lesson content found
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Content</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Lesson</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Files</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
                {formattedContents.map((content) => {
                  const contentType = content.contentType;
                  const lessonName = content.lessonId?.title || content.lessonId || "N/A";
                  const courseName = content.courseId?.title || content.courseId || "N/A";
                  const chapterName = content.chapterId?.title || content.chapterId || "N/A";
                  
                  return (
                    <tr key={content._id || content.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{content.title || "Untitled"}</p>
                          <p className="text-sm text-gray-600">{content.description || "No description"}</p>
                        </div>
                      </td>
                  <td className="py-4 px-4">
                    <div>
                          <p className="text-gray-900">{lessonName}</p>
                          <p className="text-xs text-gray-500">{courseName} / {chapterName}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                        <Badge color={getContentTypeColor(contentType)}>
                      <div className="flex items-center gap-1">
                            {getContentTypeIcon(contentType)}
                            {contentType}
                      </div>
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                          {content.video && (content.video.filePath || content.video.fileName) && (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <Video className="w-3 h-3" />
                              {content.video.fileName || "Video"} 
                              {content.video.duration && ` (${formatDuration(content.video.duration)})`}
                        </div>
                      )}
                          {content.document && (content.document.filePath || content.document.fileName) && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <FileText className="w-3 h-3" />
                              {content.document.fileName || "Document"}
                              {content.document.pageCount && ` (${content.document.pageCount} pages)`}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <Badge color={content.isActive ? "success" : "error"}>
                        {content.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {content.isRequired && (
                        <Badge color="warning">Required</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => router.push(`/lesson-content/${content._id || content.id}/view`)}
                            className="text-gray-700 hover:text-gray-900"
                          >
                        <Eye className="w-4 h-4" />
                      </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => router.push(`/lesson-content/${content._id || content.id}/edit`)}
                            className="text-gray-700 hover:text-gray-900"
                          >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                            onClick={() => handleDelete(content._id || content.id)}
                            disabled={deletingId === (content._id || content.id)}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                            {deletingId === (content._id || content.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                        <Trash2 className="w-4 h-4" />
                            )}
                      </Button>
                    </div>
                  </td>
                </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        )}

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
