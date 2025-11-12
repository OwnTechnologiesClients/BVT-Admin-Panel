"use client";

import React, { useState } from "react";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { Plus, Trash2, Edit, Eye, BookOpen } from "lucide-react";

export default function ChaptersPage() {
  const [chapters, setChapters] = useState([
    {
      id: 1,
      courseId: 1,
      courseName: "Advanced Naval Engineering Workshop",
      title: "Getting Started",
      description: "Introduction to the course and basic concepts",
      order: 1,
      duration: "2 hours",
      isActive: true,
      lessonsCount: 3,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      courseId: 1,
      courseName: "Advanced Naval Engineering Workshop",
      title: "Ship Propulsion Systems",
      description: "Understanding modern propulsion technologies",
      order: 2,
      duration: "3 hours",
      isActive: true,
      lessonsCount: 4,
      createdAt: "2024-01-16"
    },
    {
      id: 3,
      courseId: 2,
      courseName: "Maritime Security Operations",
      title: "Security Fundamentals",
      description: "Basic security principles and protocols",
      order: 1,
      duration: "2.5 hours",
      isActive: true,
      lessonsCount: 3,
      createdAt: "2024-01-20"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  const courses = ["All", "Advanced Naval Engineering Workshop", "Maritime Security Operations"];

  const filteredChapters = chapters.filter(chapter => {
    const matchesSearch = chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chapter.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === "" || chapter.courseName === filterCourse;
    return matchesSearch && matchesCourse;
  });



  const deleteChapter = (chapterId) => {
    if (confirm("Are you sure you want to delete this chapter?")) {
      setChapters(chapters.filter(chapter => chapter.id !== chapterId));
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Chapters Management"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Chapters", href: "/admin/chapters" }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chapters Management</h2>
          <p className="text-gray-600">Manage course chapters and their content</p>
        </div>
        <Button
          onClick={() => window.location.href = '/admin/chapters/add'}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Chapter
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="lg:w-64">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {courses.map(course => (
                <option key={course} value={course === "All" ? "" : course}>
                  {course}
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
              <p className="text-sm text-gray-600">Total Chapters</p>
              <p className="text-2xl font-bold text-gray-900">{chapters.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Chapters</p>
              <p className="text-2xl font-bold text-green-600">
                {chapters.filter(c => c.isActive).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900">
                {chapters.reduce((sum, chapter) => sum + chapter.lessonsCount, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Duration</p>
              <p className="text-2xl font-bold text-gray-900">2.5h</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 font-semibold">⏱️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Chapter</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Course</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Lessons</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChapters.map((chapter) => (
                <tr key={chapter.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{chapter.title}</p>
                      <p className="text-sm text-gray-600">{chapter.description}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{chapter.courseName}</td>
                  <td className="py-4 px-4 text-gray-900">{chapter.duration}</td>
                  <td className="py-4 px-4 text-gray-900">{chapter.lessonsCount}</td>
                  <td className="py-4 px-4">
                    <Badge color={chapter.isActive ? "success" : "error"}>
                      {chapter.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteChapter(chapter.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
