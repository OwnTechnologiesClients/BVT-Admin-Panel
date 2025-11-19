"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Eye, Edit, Trash2, Users, Clock, CheckCircle, Loader2 } from "lucide-react";
import * as testAPI from "@/lib/api/test";
import * as courseAPI from "@/lib/api/course";

const TestsTable = () => {
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Fetch tests
  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await testAPI.getAllTests({ limit: 100 });
      if (response.success) {
        setTests(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError(err.message || 'Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses for filter
  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses({ limit: 100 });
      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchCourses();
  }, []);

  // Format test data
  const formatTest = (test) => {
    const course = test.courseId || {};
    const courseName = course.title || 'N/A';
    
    return {
      id: test._id,
      title: test.title,
      course: courseName,
      courseId: course._id || course.id,
      duration: test.duration || 0,
      passingScore: test.passingScore || 0,
      totalQuestions: test.questions?.length || 0,
      totalStudents: 0, // This would need to come from enrollments
      completed: 0, // This would need to come from test results
      pending: 0, // This would need to come from test results
      averageScore: 0, // This would need to come from test results
      isActive: test.isActive !== undefined ? test.isActive : true,
      createdAt: test.createdAt
    };
  };

  const formattedTests = tests.map(formatTest);

  const filteredTests = formattedTests.filter(test => {
    const courseMatch = selectedCourse === "all" || test.courseId === selectedCourse;
    const statusMatch = selectedStatus === "all" || 
      (selectedStatus === "active" && test.isActive) ||
      (selectedStatus === "inactive" && !test.isActive) ||
      (selectedStatus === "completed" && test.pending === 0 && test.completed > 0) ||
      (selectedStatus === "pending" && test.pending > 0);
    return courseMatch && statusMatch;
  });

  const handleDelete = async (testId, testTitle) => {
    if (!confirm(`Are you sure you want to delete "${testTitle}"?`)) {
      return;
    }

    try {
      const response = await testAPI.deleteTest(testId);
      if (response.success) {
        await fetchTests();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete test');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

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
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
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
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTests.length === 0 ? (
              <TableRow>
                <TableCell colSpan="9" className="text-center py-8 text-gray-500">
                  No tests found
                </TableCell>
              </TableRow>
            ) : (
              filteredTests.map((test) => (
              <TableRow key={test.id}>
                <TableCell>
                  <div>
                    <Link 
                      href={`/tests/${test.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {test.title}
                    </Link>
                      {test.createdAt && (
                        <div className="text-xs text-gray-500">
                          Created: {new Date(test.createdAt).toLocaleDateString()}
                        </div>
                      )}
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
                        onClick={() => handleDelete(test.id, test.title)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                      title="Delete Test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
