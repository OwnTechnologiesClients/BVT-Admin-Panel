"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { Plus, Trash2, Edit, Eye, Video, FileText, Upload, Loader2 } from "lucide-react";
import * as lessonContentAPI from "@/lib/api/lessonContent";
import * as lessonAPI from "@/lib/api/lesson";

export default function LessonContentPage() {
  const router = useRouter();
  const [contents, setContents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLesson, setFilterLesson] = useState("");
  const [filterType, setFilterType] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Fetch lesson contents
  const fetchLessonContents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await lessonContentAPI.getAllLessonContents({ limit: 100 });
      if (response.success) {
        setContents(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch lesson contents');
      }
    } catch (err) {
      console.error('Error fetching lesson contents:', err);
      setError(err.message || 'Failed to fetch lesson contents');
    } finally {
      setLoading(false);
    }
  };

  // Fetch lessons for filter
  const fetchLessons = async () => {
    try {
      const response = await lessonAPI.getAllLessons({ limit: 100 });
      if (response.success) {
        setLessons(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching lessons:', err);
    }
  };

  useEffect(() => {
    fetchLessonContents();
    fetchLessons();
  }, []);

  // Determine content type from video/document presence
  const getContentType = (content) => {
    const hasVideo = content.video && (content.video.filePath || content.video.fileName);
    const hasDocument = content.document && (content.document.filePath || content.document.fileName);
    
    if (hasVideo && hasDocument) return "mixed";
    if (hasVideo) return "video";
    if (hasDocument) return "document";
    return "none";
  };

  // Filter contents
  const filteredContents = contents.filter(content => {
    const matchesSearch = 
      (content.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (content.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const lessonName = content.lessonId?.title || content.lessonId || "";
    const matchesLesson = filterLesson === "" || lessonName === filterLesson;
    
    const contentType = getContentType(content);
    const matchesType = filterType === "" || contentType === filterType;
    
    return matchesSearch && matchesLesson && matchesType;
  });

  const handleDelete = async (contentId) => {
    if (!confirm("Are you sure you want to delete this lesson content?")) {
      return;
    }

    try {
      setDeletingId(contentId);
      const response = await lessonContentAPI.deleteLessonContent(contentId);
      if (response.success) {
        await fetchLessonContents();
      } else {
        alert(response.message || 'Failed to delete lesson content');
      }
    } catch (err) {
      console.error('Error deleting lesson content:', err);
      alert(err.message || 'Failed to delete lesson content');
    } finally {
      setDeletingId(null);
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

  // Get unique lesson names for filter
  const uniqueLessons = Array.from(
    new Set(
      contents
        .map(c => c.lessonId?.title || c.lessonId || "")
        .filter(Boolean)
    )
  ).sort();

  const contentTypes = ["All", "video", "document", "mixed"];

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
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
          <Button variant="outline" onClick={fetchLessonContents} className="mt-4">
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lesson Content Management</h2>
          <p className="text-gray-600">Manage videos, documents, and other lesson content</p>
        </div>
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
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="lg:w-48">
            <select
              value={filterLesson}
              onChange={(e) => setFilterLesson(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Lessons</option>
              {uniqueLessons.map(lesson => (
                <option key={lesson} value={lesson}>
                  {lesson}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {contentTypes.map(type => (
                <option key={type} value={type === "All" ? "" : type}>
                  {type}
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
              <p className="text-sm text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">{contents.length}</p>
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
                {contents.filter(c => {
                  const type = getContentType(c);
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
                {contents.filter(c => {
                  const type = getContentType(c);
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
                {contents.filter(c => c.isRequired).length}
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
        {filteredContents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {contents.length === 0 ? "No lesson content found. Add your first content!" : "No content matches your filters."}
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
                {filteredContents.map((content) => {
                  const contentType = getContentType(content);
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
      </div>
    </div>
  );
}
