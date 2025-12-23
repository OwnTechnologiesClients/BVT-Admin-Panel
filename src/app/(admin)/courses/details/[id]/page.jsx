"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { ArrowLeft, Edit, Trash2, Users, Calendar, DollarSign, Clock, Loader2 } from "lucide-react";
import * as courseAPI from "@/lib/api/course";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";
import CourseStudentsTable from "@/components/courses/CourseStudentsTable";

export default function CourseDetailsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [courseData, setCourseData] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await courseAPI.getCourseWithStructure(id);
        if (response.success) {
          setCourseData(response.data.course);
          setChapters(response.data.structure?.chapters || []);
        } else {
          setError(response.message || 'Course not found');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message || 'Failed to fetch course');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  // Handle delete
  const handleDelete = async () => {
    const result = await showDeleteConfirm(
      `Delete "${courseData?.title}"?`,
      'This action cannot be undone. All course data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
      try {
        setDeleting(true);
        const response = await courseAPI.deleteCourse(id);
        if (response.success) {
          showSuccess('Course Deleted!', `"${courseData?.title}" has been deleted successfully.`);
          setTimeout(() => {
            router.push('/courses');
          }, 1500);
        } else {
          showError('Delete Failed', response.message || 'Failed to delete course');
        }
      } catch (err) {
        showError('Error', err.message || 'Failed to delete course');
      } finally {
        setDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="max-w-xl mx-auto p-8">
        <PageBreadcrumb 
          pageTitle="Course Details"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Courses", href: "/courses" },
            { label: "Course Details", href: `/courses/details/${id}` }
          ]}
        />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-600">{error || 'Course not found'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/courses')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  // Extract instructor name
  const instructor = courseData.instructor?.userId || {};
  const instructorName = instructor.firstName && instructor.lastName
    ? `${instructor.firstName} ${instructor.lastName}`
    : instructor.username || 'N/A';

  // Format learning objectives
  const learningObjectives = Array.isArray(courseData.learningObjectives)
    ? courseData.learningObjectives
    : (typeof courseData.learningObjectives === 'string' && courseData.learningObjectives.trim()
        ? courseData.learningObjectives.split('\n').filter(obj => obj.trim())
        : []);

  // Format prerequisites
  const prerequisites = Array.isArray(courseData.prerequisites)
    ? courseData.prerequisites
    : (typeof courseData.prerequisites === 'string' && courseData.prerequisites.trim()
        ? courseData.prerequisites.split('\n').filter(prereq => prereq.trim())
        : []);

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Course Details"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Courses", href: "/courses" },
          { label: "Course Details", href: `/courses/details/${id}` }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push('/courses')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Button>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => router.push(`/courses/update/${id}`)}
          >
            <Edit className="w-4 h-4" />
            Edit Course
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Course
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Course Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Image */}
          <div className="lg:col-span-1">
            {courseData.image ? (
              <img 
                src={courseData.image} 
                alt={courseData.title}
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.src = '/images/course-placeholder.jpg';
                }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>

          {/* Course Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{courseData.title}</h1>
              <p className="text-gray-600 mt-2">{courseData.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge color="default">{courseData.category?.name || 'N/A'}</Badge>
              <Badge color={courseData.status === "active" ? "success" : courseData.status === "draft" ? "warning" : "error"}>
                {courseData.status ? courseData.status.charAt(0).toUpperCase() + courseData.status.slice(1) : 'Draft'}
              </Badge>
              <Badge color={courseData.isOnline ? "info" : "default"}>
                {courseData.isOnline ? "Online" : "Offline"}
              </Badge>
              {courseData.isFeatured && (
                <Badge color="warning">Featured</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{courseData.maxStudents || 0} max students</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{courseData.duration || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 capitalize">{courseData.level || 'Beginner'}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">
                  ${courseData.price || 0}
                  {courseData.originalPrice && courseData.originalPrice > courseData.price && (
                    <span className="ml-1 text-gray-400 line-through">${courseData.originalPrice}</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("structure")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "structure"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Course Structure
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "students"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Registered Students
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Course Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Instructor</label>
                  <p className="text-gray-900">{instructorName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Max Students</label>
                  <p className="text-gray-900">{courseData.maxStudents || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900">
                    {courseData.createdAt ? new Date(courseData.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                {courseData.createdBy && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created By</label>
                    <p className="text-gray-900">
                      {courseData.createdBy.firstName && courseData.createdBy.lastName
                        ? `${courseData.createdBy.firstName} ${courseData.createdBy.lastName}`
                        : 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Objectives & Prerequisites */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Objectives</h3>
              {learningObjectives.length > 0 ? (
                <ul className="space-y-2 mb-6">
                  {learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-900">{objective}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mb-6">No learning objectives specified</p>
              )}

              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Prerequisites</h3>
              {prerequisites.length > 0 ? (
                <ul className="space-y-2">
                  {prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-900">{prereq}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No prerequisites specified</p>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "structure" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Structure</h3>
          {chapters.length > 0 ? (
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <div key={chapter._id || chapter.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {chapter.title || 'Untitled Chapter'}
                      </h4>
                      {chapter.description && (
                        <p className="text-sm text-gray-600 mt-1">{chapter.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {chapter.lessons && chapter.lessons.length > 0 && (
                        <>
                          <p className="text-sm text-gray-600">{chapter.lessons.length} lesson(s)</p>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Display lessons if available */}
                  {chapter.lessons && chapter.lessons.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <ul className="space-y-2">
                        {chapter.lessons.map((lesson, lessonIndex) => (
                          <li key={lesson._id || lesson.id || lessonIndex} className="text-sm text-gray-600">
                            • {lesson.title || 'Untitled Lesson'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No chapters available for this course</p>
          )}
        </div>
      )}

      {activeTab === "students" && (
        <CourseStudentsTable courseId={id} />
      )}
    </div>
  );
}
