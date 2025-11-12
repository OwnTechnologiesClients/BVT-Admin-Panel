"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { ArrowLeft, Edit, Trash2, Users, Calendar, DollarSign, Clock } from "lucide-react";

export default function CourseDetailsPage({ params }) {
  const { id } = params;

  // In a real app, you would fetch the course data by ID
  const courseData = {
    id: id,
    title: "Advanced Naval Engineering Workshop",
    slug: "advanced-naval-engineering-workshop",
    description: "Comprehensive workshop covering advanced naval engineering principles, ship systems, and modern technologies used in naval vessels.",
    category: "Marine Engineering",
    instructor: "Commander James Rodriguez",
    duration: "5 days",
    level: "Advanced",
    price: 2500,
    originalPrice: 3000,
    image: "/images/course-placeholder.jpg",
    isFeatured: true,
    isOnline: false,
    maxStudents: 25,
    prerequisites: "Basic knowledge of marine engineering principles",
    learningObjectives: [
      "Understand advanced naval engineering concepts",
      "Learn modern ship system technologies",
      "Master troubleshooting techniques",
      "Apply engineering principles to real-world scenarios"
    ],
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    studentsCount: 15,
    chaptersCount: 8,
    lessonsCount: 24
  };

  const chapters = [
    {
      id: 1,
      title: "Introduction to Naval Engineering",
      description: "Overview of naval engineering principles",
      order: 1,
      duration: "2 hours",
      lessonsCount: 3
    },
    {
      id: 2,
      title: "Ship Propulsion Systems",
      description: "Understanding modern propulsion technologies",
      order: 2,
      duration: "3 hours",
      lessonsCount: 4
    },
    {
      id: 3,
      title: "Electrical Systems",
      description: "Naval electrical systems and power distribution",
      order: 3,
      duration: "2.5 hours",
      lessonsCount: 3
    }
  ];

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Course Details"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Courses", href: "/admin/courses" },
          { label: "Course Details", href: `/admin/courses/details/${id}` }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Course
          </Button>
          <Button variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
            Delete Course
          </Button>
        </div>
      </div>

      {/* Course Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Image */}
          <div className="lg:col-span-1">
            <img 
              src={courseData.image} 
              alt={courseData.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>

          {/* Course Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{courseData.title}</h1>
              <p className="text-gray-600 mt-2">{courseData.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge color="default">{courseData.category}</Badge>
              <Badge color={courseData.status === "Active" ? "success" : "warning"}>
                {courseData.status}
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
                <span className="text-sm text-gray-600">{courseData.studentsCount} students</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{courseData.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{courseData.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">${courseData.price}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Instructor</label>
              <p className="text-gray-900">{courseData.instructor}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Max Students</label>
              <p className="text-gray-900">{courseData.maxStudents}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Prerequisites</label>
              <p className="text-gray-900">{courseData.prerequisites}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Created</label>
              <p className="text-gray-900">{new Date(courseData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Objectives</h3>
          <ul className="space-y-2">
            {courseData.learningObjectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-900">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Course Structure */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Structure</h3>
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Chapter {chapter.order}: {chapter.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{chapter.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{chapter.duration}</p>
                  <p className="text-sm text-gray-600">{chapter.lessonsCount} lessons</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
