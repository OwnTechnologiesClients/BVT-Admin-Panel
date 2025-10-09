"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Eye, Edit, Trash2, Users, Clock, CheckCircle } from "lucide-react";

const TestsTable = () => {
  const [tests] = useState([
    {
      id: 1,
      title: "Marine Engineering Fundamentals - Final Exam",
      course: "Marine Engineering Fundamentals",
      duration: 60,
      passingScore: 70,
      totalQuestions: 20,
      totalStudents: 45,
      completed: 38,
      pending: 7,
      averageScore: 78.5,
      isActive: true,
      createdAt: "2025-01-15",
    },
    {
      id: 2,
      title: "Navigation Systems - Module 1 Quiz",
      course: "Advanced Navigation Techniques",
      duration: 30,
      passingScore: 75,
      totalQuestions: 15,
      totalStudents: 32,
      completed: 32,
      pending: 0,
      averageScore: 82.3,
      isActive: true,
      createdAt: "2025-01-20",
    },
    {
      id: 3,
      title: "Maritime Safety Assessment",
      course: "Maritime Safety Protocols",
      duration: 45,
      passingScore: 80,
      totalQuestions: 25,
      totalStudents: 28,
      completed: 15,
      pending: 13,
      averageScore: 75.8,
      isActive: true,
      createdAt: "2025-02-01",
    },
    {
      id: 4,
      title: "Naval Operations - Mid-term Exam",
      course: "Naval Operations Management",
      duration: 90,
      passingScore: 70,
      totalQuestions: 30,
      totalStudents: 38,
      completed: 20,
      pending: 18,
      averageScore: 71.2,
      isActive: true,
      createdAt: "2025-02-05",
    },
    {
      id: 5,
      title: "Submarine Systems - Practice Test",
      course: "Submarine Systems Operation",
      duration: 45,
      passingScore: 65,
      totalQuestions: 18,
      totalStudents: 22,
      completed: 0,
      pending: 22,
      averageScore: 0,
      isActive: false,
      createdAt: "2025-02-08",
    },
  ]);

  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const courses = ["all", ...new Set(tests.map(test => test.course))];

  const filteredTests = tests.filter(test => {
    const courseMatch = selectedCourse === "all" || test.course === selectedCourse;
    const statusMatch = selectedStatus === "all" || 
      (selectedStatus === "active" && test.isActive) ||
      (selectedStatus === "inactive" && !test.isActive) ||
      (selectedStatus === "completed" && test.pending === 0) ||
      (selectedStatus === "pending" && test.pending > 0);
    return courseMatch && statusMatch;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Courses</option>
            {courses.filter(c => c !== "all").map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Fully Completed</option>
            <option value="pending">Has Pending Students</option>
          </select>
        </div>
      </div>

      {/* Tests Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Test Name</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Questions</TableCell>
              <TableCell>Pass %</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>Avg Score</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTests.map((test) => (
              <TableRow key={test.id}>
                <TableCell>
                  <div>
                    <Link 
                      href={`/tests/${test.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {test.title}
                    </Link>
                    <div className="text-xs text-gray-500">Created: {test.createdAt}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-700">{test.course}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Clock className="w-4 h-4" />
                    {test.duration} min
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-700">{test.totalQuestions}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-700">{test.passingScore}%</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-gray-700">
                        {test.completed}/{test.totalStudents} completed
                      </span>
                    </div>
                    {test.pending > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <Users className="w-3 h-3 text-orange-600" />
                        <span className="text-gray-700">
                          {test.pending} pending
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {test.completed > 0 ? (
                    <span className={`text-sm font-medium ${
                      test.averageScore >= test.passingScore 
                        ? "text-green-600" 
                        : "text-orange-600"
                    }`}>
                      {test.averageScore.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge color={test.isActive ? "success" : "default"}>
                    {test.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tests/${test.id}`}
                      className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded"
                      title="Edit Test"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                      title="Delete Test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredTests.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg mt-4">
            <p className="text-gray-600">No tests found matching your filters</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Tests</div>
          <div className="text-2xl font-bold text-gray-900">{filteredTests.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Active Tests</div>
          <div className="text-2xl font-bold text-gray-900">
            {filteredTests.filter(t => t.isActive).length}
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Students</div>
          <div className="text-2xl font-bold text-gray-900">
            {filteredTests.reduce((sum, t) => sum + t.totalStudents, 0)}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-gray-900">
            {filteredTests.reduce((sum, t) => sum + t.completed, 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestsTable;

