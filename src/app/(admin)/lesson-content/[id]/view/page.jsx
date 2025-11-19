"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import RichTextEditor from "@/components/common/RichTextEditor";
import { Button, Badge } from "@/components/ui";
import { ArrowLeft, Edit, Video, FileText, Loader2, Download, ExternalLink } from "lucide-react";
import * as lessonContentAPI from "@/lib/api/lessonContent";

export default function ViewLessonContentPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch lesson content data
  useEffect(() => {
    const fetchLessonContent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const response = await lessonContentAPI.getLessonContentById(id);
        if (response.success) {
          setContent(response.data);
        } else {
          setError(response.message || 'Failed to fetch lesson content');
        }
      } catch (err) {
        console.error('Error fetching lesson content:', err);
        setError(err.message || 'Failed to fetch lesson content');
      } finally {
        setLoading(false);
      }
    };
    fetchLessonContent();
  }, [id]);

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    // If it's already a full URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    // Otherwise, construct URL using API base URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${apiBaseUrl}${filePath}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb 
          pageTitle="View Lesson Content"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Lesson Content", href: "/lesson-content" },
            { label: "View Content", href: `/lesson-content/${id}/view` }
          ]}
        />
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" onClick={() => router.push('/lesson-content')} className="mt-4">
            Back to Lesson Content
          </Button>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb 
          pageTitle="View Lesson Content"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Lesson Content", href: "/lesson-content" },
            { label: "View Content", href: `/lesson-content/${id}/view` }
          ]}
        />
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600">Lesson content not found</p>
          <Button variant="outline" onClick={() => router.push('/lesson-content')} className="mt-4">
            Back to Lesson Content
          </Button>
        </div>
      </div>
    );
  }

  const courseName = content.courseId?.title || content.courseId || "N/A";
  const chapterName = content.chapterId?.title || content.chapterId || "N/A";
  const lessonName = content.lessonId?.title || content.lessonId || "N/A";
  const createdBy = content.createdBy 
    ? `${content.createdBy.firstName || ''} ${content.createdBy.lastName || ''}`.trim() 
    : "N/A";

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="View Lesson Content"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Lesson Content", href: "/lesson-content" },
          { label: "View Content", href: `/lesson-content/${id}/view` }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push('/lesson-content')}>
          <ArrowLeft className="w-4 h-4" />
          Back to Content
        </Button>
        <Button variant="primary" className="flex items-center gap-2" onClick={() => router.push(`/lesson-content/${id}/edit`)}>
          <Edit className="w-4 h-4" />
          Edit Content
        </Button>
      </div>

      {/* Content Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <p className="text-gray-900">{content.title || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-gray-900">{content.description || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <p className="text-gray-900">{courseName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
              <p className="text-gray-900">{chapterName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lesson</label>
              <p className="text-gray-900">{lessonName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="flex gap-2">
                <Badge color={content.isActive ? "success" : "error"}>
                  {content.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge color={content.isRequired ? "primary" : "gray"}>
                  {content.isRequired ? "Required" : "Optional"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
              <p className="text-gray-900">{createdBy}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-gray-900">
                {content.createdAt ? new Date(content.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Video Content */}
        {content.video && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Video Content</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{content.video.fileName || "Video file"}</p>
                    {content.video.duration && (
                      <p className="text-sm text-gray-600">Duration: {formatDuration(content.video.duration)}</p>
                    )}
                  </div>
                </div>
                {content.video.filePath && (
                  <div className="flex gap-2">
                    <a
                      href={getFileUrl(content.video.filePath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Video
                    </a>
                    <a
                      href={getFileUrl(content.video.filePath)}
                      download
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}
              </div>
              {content.video.filePath && (
                <div className="mt-4">
                  <video 
                    src={getFileUrl(content.video.filePath)} 
                    controls 
                    className="w-full rounded-lg max-h-96"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document Content */}
        {content.document && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Document Content</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{content.document.fileName || "Document file"}</p>
                    {content.document.pageCount && (
                      <p className="text-sm text-gray-600">Pages: {content.document.pageCount}</p>
                    )}
                  </div>
                </div>
                {content.document.filePath && (
                  <div className="flex gap-2">
                    <a
                      href={getFileUrl(content.document.filePath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Document
                    </a>
                    <a
                      href={getFileUrl(content.document.filePath)}
                      download
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}
              </div>

              {/* Extracted Text Content */}
              {content.document.extractedText && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extracted Text Content
                  </label>
                  <div className="border border-gray-300 rounded-lg">
                    <RichTextEditor
                      value={content.document.extractedText}
                      onChange={() => {}} // Read-only
                      disabled={true}
                      height="400px"
                      placeholder="No extracted text available"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Content Message */}
        {!content.video && !content.document && (
          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-600 text-center py-8">No content files available for this lesson.</p>
          </div>
        )}
      </div>
    </div>
  );
}
