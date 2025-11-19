"use client";
import React, { use } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { ArrowLeft, Edit, Loader2, Calendar, BookOpen, User } from "lucide-react";
import * as chapterAPI from "@/lib/api/chapter";

export default function ViewChapterPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [chapter, setChapter] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await chapterAPI.getChapterById(id);
        if (response.success) {
          setChapter(response.data);
        } else {
          setError('Chapter not found');
        }
      } catch (err) {
        console.error('Error fetching chapter:', err);
        setError(err.message || 'Failed to fetch chapter');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChapter();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb 
          pageTitle="Chapter Details"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Chapters", href: "/chapters" },
            { label: "Chapter Details", href: `/chapters/${id}/view` }
          ]}
        />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-600">{error || 'Chapter not found'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/chapters')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chapters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Chapter Details"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Chapters", href: "/chapters" },
          { label: "Chapter Details", href: `/chapters/${id}/view` }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push('/chapters')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chapters
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push(`/chapters/${id}/edit`)}
        >
          <Edit className="w-4 h-4" />
          Edit Chapter
        </Button>
      </div>

      {/* Chapter Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{chapter.title}</h1>
            <p className="text-gray-600 mt-2 whitespace-pre-line">{chapter.description || 'No description available'}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge color={chapter.isActive ? "success" : "error"}>
              {chapter.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Chapter Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Basic Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Chapter Title</label>
              <p className="text-gray-900 mt-1">{chapter.title}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Course</label>
              <p className="text-gray-900 mt-1">{chapter.courseId?.title || 'N/A'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <p className="text-gray-900 mt-1 whitespace-pre-line">
                {chapter.description || 'No description'}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Additional Information
          </h3>
          <div className="space-y-3">
            {chapter.createdAt && (
              <div>
                <label className="text-sm font-medium text-gray-700">Created At</label>
                <p className="text-gray-900 mt-1">
                  {new Date(chapter.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {chapter.updatedAt && (
              <div>
                <label className="text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-gray-900 mt-1">
                  {new Date(chapter.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {chapter.createdBy && (
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Created By
                </label>
                <p className="text-gray-900 mt-1">
                  {chapter.createdBy.firstName && chapter.createdBy.lastName
                    ? `${chapter.createdBy.firstName} ${chapter.createdBy.lastName}`
                    : chapter.createdBy.username || 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
