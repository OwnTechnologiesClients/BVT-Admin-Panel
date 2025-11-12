"use client";

import React, { useState } from "react";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { Plus, Trash2, Edit, Eye, Video, FileText, Upload } from "lucide-react";

export default function LessonContentPage() {
  const [contents, setContents] = useState([
    {
      id: 1,
      lessonId: 1,
      lessonName: "Course Overview",
      chapterName: "Getting Started",
      courseName: "Advanced Naval Engineering Workshop",
      title: "Introduction Video",
      description: "Course introduction and overview video",
      order: 1,
      contentType: "mixed",
      video: {
        filePath: "/uploads/videos/intro.mp4",
        fileName: "intro.mp4",
        duration: 300
      },
      document: {
        filePath: "/uploads/documents/overview.pdf",
        fileName: "overview.pdf",
        extractedText: "Course Overview Document\n\nThis course covers advanced naval engineering principles...",
        pageCount: 5
      },
      isRequired: true,
      isActive: true,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      lessonId: 1,
      lessonName: "Course Overview",
      chapterName: "Getting Started",
      courseName: "Advanced Naval Engineering Workshop",
      title: "Course Materials",
      description: "Essential reading materials for the course",
      order: 2,
      contentType: "document",
      video: null,
      document: {
        filePath: "/uploads/documents/materials.pdf",
        fileName: "materials.pdf",
        extractedText: "Course Materials\n\nRequired reading materials and resources...",
        pageCount: 12
      },
      isRequired: true,
      isActive: true,
      createdAt: "2024-01-15"
    },
    {
      id: 3,
      lessonId: 2,
      lessonName: "Introduction to Naval Engineering",
      chapterName: "Getting Started",
      courseName: "Advanced Naval Engineering Workshop",
      title: "Engineering Principles Video",
      description: "Video explaining basic naval engineering principles",
      order: 1,
      contentType: "video",
      video: {
        filePath: "/uploads/videos/principles.mp4",
        fileName: "principles.mp4",
        duration: 450
      },
      document: null,
      isRequired: true,
      isActive: true,
      createdAt: "2024-01-15"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterLesson, setFilterLesson] = useState("");
  const [filterType, setFilterType] = useState("");

  const lessons = ["All", "Course Overview", "Introduction to Naval Engineering"];
  const contentTypes = ["All", "video", "document", "mixed"];

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLesson = filterLesson === "" || content.lessonName === filterLesson;
    const matchesType = filterType === "" || content.contentType === filterType;
    return matchesSearch && matchesLesson && matchesType;
  });

  const addContent = () => {
    const newContent = {
      id: contents.length + 1,
      lessonId: 1,
      lessonName: "Course Overview",
      chapterName: "Getting Started",
      courseName: "Advanced Naval Engineering Workshop",
      title: "",
      description: "",
      order: contents.length + 1,
      contentType: "video",
      video: null,
      document: null,
      isRequired: true,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setContents([...contents, newContent]);
  };

  const updateContent = (contentId, field, value) => {
    setContents(contents.map(content => 
      content.id === contentId 
        ? { ...content, [field]: value }
        : content
    ));
  };

  const deleteContent = (contentId) => {
    if (confirm("Are you sure you want to delete this content?")) {
      setContents(contents.filter(content => content.id !== contentId));
    }
  };

  const formatDuration = (seconds) => {
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

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Lesson Content Management"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Lesson Content", href: "/admin/lesson-content" }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lesson Content Management</h2>
          <p className="text-gray-600">Manage videos, documents, and other lesson content</p>
        </div>
        <Button
          onClick={addContent}
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
              {lessons.map(lesson => (
                <option key={lesson} value={lesson === "All" ? "" : lesson}>
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
                {contents.filter(c => c.contentType === "video" || c.contentType === "mixed").length}
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
                {contents.filter(c => c.contentType === "document" || c.contentType === "mixed").length}
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
              {filteredContents.map((content) => (
                <tr key={content.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{content.title}</p>
                      <p className="text-sm text-gray-600">{content.description}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{content.lessonName}</td>
                  <td className="py-4 px-4">
                    <Badge color={getContentTypeColor(content.contentType)}>
                      <div className="flex items-center gap-1">
                        {getContentTypeIcon(content.contentType)}
                        {content.contentType}
                      </div>
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      {content.video && (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <Video className="w-3 h-3" />
                          {content.video.fileName} ({formatDuration(content.video.duration)})
                        </div>
                      )}
                      {content.document && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <FileText className="w-3 h-3" />
                          {content.document.fileName} ({content.document.pageCount} pages)
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
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteContent(content.id)}
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
