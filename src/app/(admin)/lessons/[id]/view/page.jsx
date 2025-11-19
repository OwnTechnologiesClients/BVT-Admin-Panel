"use client";
import React, { use } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { ArrowLeft, Edit, Loader2, Calendar, BookOpen, User, GraduationCap } from "lucide-react";
import * as lessonAPI from "@/lib/api/lesson";

export default function ViewLessonPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [lesson, setLesson] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await lessonAPI.getLessonById(id);
        if (response.success) {
          setLesson(response.data);
        } else {
          setError('Lesson not found');
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError(err.message || 'Failed to fetch lesson');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLesson();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb 
          pageTitle="Lesson Details"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Lessons", href: "/lessons" },
            { label: "Lesson Details", href: `/lessons/${id}/view` }
          ]}
        />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-600">{error || 'Lesson not found'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/lessons')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Lesson Details"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Lessons", href: "/lessons" },
          { label: "Lesson Details", href: `/lessons/${id}/view` }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push('/lessons')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lessons
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push(`/lessons/${id}/edit`)}
        >
          <Edit className="w-4 h-4" />
          Edit Lesson
        </Button>
      </div>

      {/* Lesson Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            <p className="text-gray-600 mt-2 whitespace-pre-line">{lesson.description || 'No description available'}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge color={lesson.isActive ? "success" : "error"}>
              {lesson.isActive ? "Active" : "Inactive"}
            </Badge>
            {lesson.isFree && (
              <Badge color="info">Free Lesson</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Basic Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Lesson Title</label>
              <p className="text-gray-900 mt-1">{lesson.title}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Course
              </label>
              <p className="text-gray-900 mt-1">{lesson.courseId?.title || 'N/A'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Chapter</label>
              <p className="text-gray-900 mt-1">{lesson.chapterId?.title || 'N/A'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <p className="text-gray-900 mt-1 whitespace-pre-line">
                {lesson.description || 'No description'}
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
            {lesson.createdAt && (
              <div>
                <label className="text-sm font-medium text-gray-700">Created At</label>
                <p className="text-gray-900 mt-1">
                  {new Date(lesson.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {lesson.updatedAt && (
              <div>
                <label className="text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-gray-900 mt-1">
                  {new Date(lesson.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {lesson.createdBy && (
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Created By
                </label>
                <p className="text-gray-900 mt-1">
                  {lesson.createdBy.firstName && lesson.createdBy.lastName
                    ? `${lesson.createdBy.firstName} ${lesson.createdBy.lastName}`
                    : lesson.createdBy.username || 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
