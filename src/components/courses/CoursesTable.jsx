"use client";

import React, { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { Eye, Edit, Trash2, Plus, Filter, Search } from "lucide-react";

const CoursesTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const courses = [
    {
      id: 1,
      title: "Advanced Naval Engineering Workshop",
      instructor: "Commander James Rodriguez",
      students: 15,
      status: "Active",
      type: "Offline",
      category: "Marine Engineering",
      duration: "5 days",
      price: "$2,500",
      difficulty: "Advanced",
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Maritime Security Operations",
      instructor: "Captain Michael Thompson",
      students: 12,
      status: "Active",
      type: "Offline",
      category: "Maritime Safety",
      duration: "3 days",
      price: "$1,800",
      difficulty: "Intermediate",
      createdAt: "2024-01-20"
    },
    {
      id: 3,
      title: "Submarine Operations Masterclass",
      instructor: "Commander Lisa Chen",
      students: 8,
      status: "Active",
      type: "Offline",
      category: "Submarine Operations",
      duration: "7 days",
      price: "$3,200",
      difficulty: "Advanced",
      createdAt: "2024-01-25"
    },
    {
      id: 4,
      title: "Marine Engineering Fundamentals",
      instructor: "Commander Sarah Johnson",
      students: 150,
      status: "Active",
      type: "Online",
      category: "Marine Engineering",
      duration: "8 weeks",
      price: "$800",
      difficulty: "Beginner",
      createdAt: "2024-02-01"
    },
    {
      id: 5,
      title: "Naval Architecture Principles",
      instructor: "Captain David Wilson",
      students: 25,
      status: "Draft",
      type: "Online",
      category: "Marine Engineering",
      duration: "6 weeks",
      price: "$1,200",
      difficulty: "Intermediate",
      createdAt: "2024-02-05"
    },
    {
      id: 6,
      title: "Navigation Systems & GPS",
      instructor: "Lieutenant Commander Alex Brown",
      students: 45,
      status: "Active",
      type: "Hybrid",
      category: "Navigation",
      duration: "4 weeks",
      price: "$1,500",
      difficulty: "Intermediate",
      createdAt: "2024-02-10"
    }
  ];

  const categories = ["All", "Marine Engineering", "Navigation", "Maritime Safety", "Naval Operations", "Submarine Operations"];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "" || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "success";
      case "Draft": return "warning";
      case "Inactive": return "error";
      default: return "default";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Online": return "info";
      case "Offline": return "default";
      case "Hybrid": return "warning";
      default: return "default";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner": return "info";
      case "Intermediate": return "warning";
      case "Advanced": return "error";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Courses Management</h2>
          <p className="text-gray-600">Manage and monitor all training courses</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Course
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses by title or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-64">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category === "All" ? "" : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Filters Button */}
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-semibold">C</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-green-600">
                {courses.filter(c => c.status === "Active").length}
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
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.reduce((sum, course) => sum + course.students, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900">
                ${Math.round(courses.reduce((sum, course) => sum + parseInt(course.price.replace('$', '')), 0) / courses.length)}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 font-semibold">$</span>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Course</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Instructor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Students</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{course.title}</p>
                      <p className="text-sm text-gray-600">{course.duration} • {course.difficulty}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{course.instructor}</td>
                  <td className="py-4 px-4">
                    <Badge color="default">{course.category}</Badge>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{course.students}</td>
                  <td className="py-4 px-4">
                    <Badge color={getTypeColor(course.type)}>{course.type}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge color={getStatusColor(course.status)}>{course.status}</Badge>
                  </td>
                  <td className="py-4 px-4 text-gray-900 font-medium">{course.price}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {filteredCourses.length} of {courses.length} courses
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="primary" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesTable;
