"use client";

import React, { useState } from "react";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { Plus, Trash2, Edit, Eye, BookOpen, Play, FileText } from "lucide-react";

export default function LessonsPage() {
  const [lessons, setLessons] = useState([
    {
      id: 1,
      chapterId: 1,
      chapterName: "Getting Started",
      courseName: "Advanced Naval Engineering Workshop",
      title: "Course Overview",
      description: "Understanding the course structure and objectives",
      order: 1,
      duration: "30 minutes",
      type: "lecture",
      isActive: true,
      isFree: false,
      contentCount: 2,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      chapterId: 1,
      chapterName: "Getting Started",
      courseName: "Advanced Naval Engineering Workshop",
      title: "Introduction to Naval Engineering",
      description: "Basic concepts and principles of naval engineering",
      order: 2,
      duration: "45 minutes",
      type: "lecture",
      isActive: true,
      isFree: true,
      contentCount: 1,
      createdAt: "2024-01-15"
    },
    {
      id: 3,
      chapterId: 2,
      chapterName: "Ship Propulsion Systems",
      courseName: "Advanced Naval Engineering Workshop",
      title: "Propulsion System Components",
      description: "Understanding the key components of ship propulsion",
      order: 1,
      duration: "60 minutes",
      type: "practical",
      isActive: true,
      isFree: false,
      contentCount: 3,
      createdAt: "2024-01-16"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [filterType, setFilterType] = useState("");

  const chapters = ["All", "Getting Started", "Ship Propulsion Systems"];
  const types = ["All", "lecture", "practical", "workshop", "assessment"];

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChapter = filterChapter === "" || lesson.chapterName === filterChapter;
    const matchesType = filterType === "" || lesson.type === filterType;
    return matchesSearch && matchesChapter && matchesType;
  });



  const deleteLesson = (lessonId) => {
    if (confirm("Are you sure you want to delete this lesson?")) {
      setLessons(lessons.filter(lesson => lesson.id !== lessonId));
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "lecture": return <BookOpen className="w-4 h-4" />;
      case "practical": return <Play className="w-4 h-4" />;
      case "workshop": return <FileText className="w-4 h-4" />;
      case "assessment": return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "lecture": return "info";
      case "practical": return "success";
      case "workshop": return "warning";
      case "assessment": return "error";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Lessons Management"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Lessons", href: "/admin/lessons" }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lessons Management</h2>
          <p className="text-gray-600">Manage individual lessons and their content</p>
        </div>
        <Button
          onClick={() => window.location.href = '/admin/lessons/add'}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Lesson
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="lg:w-48">
            <select
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {chapters.map(chapter => (
                <option key={chapter} value={chapter === "All" ? "" : chapter}>
                  {chapter}
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
              {types.map(type => (
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
              <p className="text-sm text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900">{lessons.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Free Lessons</p>
              <p className="text-2xl font-bold text-green-600">
                {lessons.filter(l => l.isFree).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold">🆓</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">
                {lessons.reduce((sum, lesson) => sum + lesson.contentCount, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold">📁</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Duration</p>
              <p className="text-2xl font-bold text-gray-900">45m</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 font-semibold">⏱️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Lesson</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Chapter</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Content</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson) => (
                <tr key={lesson.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{lesson.title}</p>
                      <p className="text-sm text-gray-600">{lesson.description}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{lesson.chapterName}</td>
                  <td className="py-4 px-4">
                    <Badge color={getTypeColor(lesson.type)}>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(lesson.type)}
                        {lesson.type}
                      </div>
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{lesson.duration}</td>
                  <td className="py-4 px-4 text-gray-900">{lesson.contentCount} items</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <Badge color={lesson.isActive ? "success" : "error"}>
                        {lesson.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {lesson.isFree && (
                        <Badge color="info">Free</Badge>
                      )}
                    </div>
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
                        onClick={() => deleteLesson(lesson.id)}
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
