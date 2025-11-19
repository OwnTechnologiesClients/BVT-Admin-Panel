"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb, ComponentCard } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import {
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Award,
  Calendar,
  FileText,
  TrendingUp,
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  Loader2,
} from "lucide-react";
import * as testAPI from "@/lib/api/test";
import * as enrollmentAPI from "@/lib/api/enrollment";

const defaultStudents = [
  {
    id: 1,
    name: "John Anderson",
    email: "john.anderson@navy.mil",
    enrollmentDate: "2025-01-10",
    status: "completed",
    score: 85,
    attempts: 1,
    completedAt: "2025-01-20 14:30",
    timeSpent: 52,
    passed: true,
  },
  {
    id: 2,
    name: "Emily Roberts",
    email: "emily.roberts@navy.mil",
    enrollmentDate: "2025-01-10",
    status: "completed",
    score: 92,
    attempts: 1,
    completedAt: "2025-01-20 15:15",
    timeSpent: 58,
    passed: true,
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "michael.chen@navy.mil",
    enrollmentDate: "2025-01-10",
    status: "completed",
    score: 68,
    attempts: 2,
    completedAt: "2025-01-21 10:20",
    timeSpent: 60,
    passed: false,
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah.williams@navy.mil",
    enrollmentDate: "2025-01-10",
    status: "completed",
    score: 95,
    attempts: 1,
    completedAt: "2025-01-20 16:45",
    timeSpent: 55,
    passed: true,
  },
  {
    id: 5,
    name: "David Martinez",
    email: "david.martinez@navy.mil",
    enrollmentDate: "2025-01-10",
    status: "pending",
    score: null,
    attempts: 0,
    completedAt: null,
    timeSpent: null,
    passed: null,
  },
  {
    id: 6,
    name: "Lisa Thompson",
    email: "lisa.thompson@navy.mil",
    enrollmentDate: "2025-01-10",
    status: "completed",
    score: 78,
    attempts: 1,
    completedAt: "2025-01-21 09:30",
    timeSpent: 59,
    passed: true,
  },
  {
    id: 7,
    name: "James Wilson",
    email: "james.wilson@navy.mil",
    enrollmentDate: "2025-01-10",
    status: "pending",
    score: null,
    attempts: 0,
    completedAt: null,
    timeSpent: null,
    passed: null,
  },
  {
    id: 8,
    name: "Jennifer Brown",
    email: "jennifer.brown@navy.mil",
    enrollmentDate: "2025-01-10",
    status: "completed",
    score: 82,
    attempts: 1,
    completedAt: "2025-01-21 11:00",
    timeSpent: 57,
    passed: true,
  },
];

const defaultTestData = (testId) => ({
  id: testId,
  title: "Marine Engineering Fundamentals - Final Exam",
  course: "Marine Engineering Fundamentals",
  description:
    "Comprehensive final examination covering all modules of Marine Engineering Fundamentals. This test evaluates understanding of basic marine engineering principles, propulsion systems, and maintenance procedures.",
  duration: 60,
  passingScore: 70,
  totalQuestions: 20,
  totalStudents: 45,
  completed: 38,
  pending: 7,
  averageScore: 78.5,
  highestScore: 95,
  lowestScore: 45,
  isActive: true,
  randomizeQuestions: true,
  showResults: true,
  maxAttempts: 3,
  createdAt: "2025-01-15",
  createdBy: "Dr. Sarah Johnson",
});

const TestDetailsView = ({
  testId,
  breadcrumbProps = {},
  basePath = "/tests",
  previewNotice,
}) => {
  const router = useRouter();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("completed");
  const [resultsReleased, setResultsReleased] = useState(false);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await testAPI.getTestById(testId);
        if (response.success) {
          const test = response.data;
          const courseId = test.courseId?._id || test.courseId;
          
          setTestData({
            id: test._id || test.id,
            title: test.title || 'Untitled Test',
            course: test.courseId?.title || test.courseName || 'N/A',
            courseId: courseId,
            description: test.description || '',
            duration: test.duration || 60,
            passingScore: test.passingScore || 70,
            totalQuestions: test.questions?.length || 0,
            totalStudents: 0, // Will be updated after fetching enrollments
            completed: 0, // This would come from test results
            pending: 0, // This would come from test results
            averageScore: 0, // This would come from test results
            highestScore: 0, // This would come from test results
            lowestScore: 0, // This would come from test results
            isActive: test.isActive !== undefined ? test.isActive : true,
            randomizeQuestions: test.randomizeQuestions || false,
            showResults: test.showResults !== undefined ? test.showResults : true,
            maxAttempts: test.maxAttempts || 0,
            createdAt: test.createdAt || new Date().toISOString(),
            createdBy: typeof test.createdBy === 'object' && test.createdBy !== null
              ? (test.createdBy.fullName || 
                 (test.createdBy.firstName && test.createdBy.lastName 
                   ? `${test.createdBy.firstName} ${test.createdBy.lastName}` 
                   : test.createdBy.email || test.createdBy.username || 'N/A'))
              : (test.createdBy || 'N/A'),
            questions: test.questions || []
          });
          
          // Fetch enrolled students for the course
          if (courseId) {
            try {
              const enrollmentsResponse = await enrollmentAPI.getCourseEnrollments(courseId);
              if (enrollmentsResponse.success) {
                const enrollments = Array.isArray(enrollmentsResponse.data?.enrollments) 
                  ? enrollmentsResponse.data.enrollments 
                  : (Array.isArray(enrollmentsResponse.data) ? enrollmentsResponse.data : []);
                const enrolledCount = enrollments.length;
                
                // Process enrollments to extract student performance data
                const studentsData = [];
                let completedCount = 0;
                let totalScore = 0;
                let highestScore = 0;
                let lowestScore = null;
                
                enrollments.forEach((enrollment) => {
                  const student = enrollment.studentId;
                  if (!student) return;
                  
                  // Find test completion data for this test
                  const testCompletion = enrollment.testsCompleted?.find(
                    (tc) => {
                      const tcTestId = tc.testId?._id?.toString() || 
                                      tc.testId?.toString() || 
                                      (typeof tc.testId === 'string' ? tc.testId : null);
                      return tcTestId === testId;
                    }
                  );
                  
                  const studentName = student.fullName || 
                                     (student.firstName && student.lastName 
                                       ? `${student.firstName} ${student.lastName}` 
                                       : student.email || student.username || 'Unknown');
                  const studentEmail = student.email || 'N/A';
                  
                  if (testCompletion) {
                    // Student has completed the test
                    completedCount++;
                    const score = testCompletion.score || 0;
                    totalScore += score;
                    if (score > highestScore) highestScore = score;
                    if (lowestScore === null || score < lowestScore) lowestScore = score;
                    
                    studentsData.push({
                      id: student._id || student.id || enrollment._id,
                      name: studentName,
                      email: studentEmail,
                      enrollmentDate: enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toISOString().split('T')[0] : 'N/A',
                      status: 'completed',
                      score: score,
                      attempts: testCompletion.attemptNumber || 1,
                      completedAt: testCompletion.completedAt 
                        ? new Date(testCompletion.completedAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : null,
                      timeSpent: null, // Not stored in enrollment model
                      passed: testCompletion.passed || false
                    });
                  } else {
                    // Student hasn't completed the test yet
                    studentsData.push({
                      id: student._id || student.id || enrollment._id,
                      name: studentName,
                      email: studentEmail,
                      enrollmentDate: enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toISOString().split('T')[0] : 'N/A',
                      status: 'pending',
                      score: null,
                      attempts: 0,
                      completedAt: null,
                      timeSpent: null,
                      passed: null
                    });
                  }
                });
                
                const averageScore = completedCount > 0 ? totalScore / completedCount : 0;
                const pendingCount = enrolledCount - completedCount;
                
                setStudents(studentsData);
                setTestData(prev => ({
                  ...prev,
                  totalStudents: enrolledCount,
                  completed: completedCount,
                  pending: pendingCount,
                  averageScore: averageScore,
                  highestScore: completedCount > 0 ? highestScore : 0,
                  lowestScore: completedCount > 0 && lowestScore !== null ? lowestScore : 0
                }));
              }
            } catch (err) {
              console.log('Could not fetch course enrollments:', err);
            }
          }
        } else {
          setError(response.message || 'Test not found');
          // Fallback to default data for preview
          setTestData(defaultTestData(testId));
        }
      } catch (err) {
        console.error('Error fetching test:', err);
        setError(err.message || 'Failed to fetch test');
        // Fallback to default data for preview
        setTestData(defaultTestData(testId));
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchTest();
    } else {
      setTestData(defaultTestData(testId));
      setLoading(false);
    }
  }, [testId]);

  const filteredStudents = useMemo(() => {
    if (selectedTab === "all") return students;
    return students.filter((student) => student.status === selectedTab);
  }, [selectedTab, students]);

  const passedCount = students.filter((s) => s.passed === true).length;
  const failedCount = students.filter(
    (s) => s.status === "completed" && s.passed === false
  ).length;
  const completionRate = testData && testData.totalStudents > 0
    ? ((testData.completed / testData.totalStudents) * 100).toFixed(1)
    : '0.0';

  const handleEditQuestions = () => {
    router.push(`${basePath}/${testId}/questions/edit`);
  };

  const handleViewQuestions = () => {
    router.push(`${basePath}/${testId}/questions/view`);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !testData) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb
          pageTitle="Test Details"
          homeHref={breadcrumbProps?.homeHref}
          homeLabel={breadcrumbProps?.homeLabel}
          trail={breadcrumbProps?.trail || []}
          items={breadcrumbProps?.items}
        />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!testData) {
    return null;
  }

  const { trail: incomingTrail = [], ...restBreadcrumb } = breadcrumbProps || {};
  const breadcrumbTrail = [...incomingTrail, { label: testData.title }];

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle={testData.title}
        homeHref={restBreadcrumb.homeHref}
        homeLabel={restBreadcrumb.homeLabel}
        trail={breadcrumbTrail}
        items={restBreadcrumb.items}
      />

      {previewNotice && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>{previewNotice}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{testData.title}</h1>
            <Badge color={testData.isActive ? "success" : "default"}>
              {testData.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Course: <span className="font-medium">{testData.course}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`${basePath}/${testId}/edit`)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Edit Test
          </Button>
          <Button
            variant="primary"
            onClick={() => setResultsReleased(!resultsReleased)}
            className="flex items-center gap-2"
          >
            {resultsReleased ? (
              <>
                <Eye className="h-4 w-4" />
                Results Released
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                Release Results
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {testData.totalStudents}
          </div>
          <p className="mt-1 text-xs text-gray-600">Enrolled Students</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="rounded-lg bg-green-100 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">{completionRate}%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {testData.completed}
          </div>
          <p className="mt-1 text-xs text-gray-600">Completed</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="rounded-lg bg-orange-100 p-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">
              {testData.totalStudents > 0 ? ((testData.pending / testData.totalStudents) * 100).toFixed(0) : '0'}%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {testData.pending}
          </div>
          <p className="mt-1 text-xs text-gray-600">Pending</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="rounded-lg bg-purple-100 p-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Average</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {testData.averageScore ? testData.averageScore.toFixed(1) : '0.0'}%
          </div>
          <p className="mt-1 text-xs text-gray-600">Score</p>
        </div>
      </div>

      <ComponentCard title="Test Information">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-base font-semibold text-gray-900">
                {testData.duration} minutes
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-base font-semibold text-gray-900">
                {testData.totalQuestions} questions
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Passing Score</p>
              <p className="text-base font-semibold text-gray-900">
                {testData.passingScore}%
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-orange-50 p-2">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-base font-semibold text-gray-900">
                {testData.createdAt ? new Date(testData.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-pink-50 p-2">
              <Users className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Created By</p>
              <p className="text-base font-semibold text-gray-900">
                {testData.createdBy}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-yellow-50 p-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Max Attempts</p>
              <p className="text-base font-semibold text-gray-900">
                {testData.maxAttempts === 0
                  ? "Unlimited"
                  : testData.maxAttempts}
              </p>
            </div>
          </div>
        </div>

        {testData.description && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-900">
              Description
            </h4>
            <p className="text-sm leading-relaxed text-gray-700">
              {testData.description}
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                testData.randomizeQuestions ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
            <span className="text-sm text-gray-700">Randomize Questions</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                testData.showResults ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
            <span className="text-sm text-gray-700">
              Show Results Immediately
            </span>
          </div>
        </div>
      </ComponentCard>

      <div className="mb-8 flex gap-4">
        <Button variant="primary" onClick={handleEditQuestions}>
          Edit Questions
        </Button>
        <Button variant="outline" onClick={handleViewQuestions}>
          View Questions
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ComponentCard title="Score Distribution">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Highest Score</span>
              <span className="text-lg font-bold text-green-600">
                {testData.highestScore ? testData.highestScore : '0'}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Score</span>
              <span className="text-lg font-bold text-blue-600">
                {testData.averageScore ? testData.averageScore.toFixed(1) : '0.0'}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lowest Score</span>
              <span className="text-lg font-bold text-red-600">
                {testData.lowestScore ? testData.lowestScore : '0'}%
              </span>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Pass/Fail Status">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Passed</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {passedCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-gray-600">Failed</span>
              </div>
              <span className="text-lg font-bold text-red-600">
                {failedCount}
              </span>
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="mb-2 text-xs text-gray-600">Pass Rate</div>
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-green-600 transition-all"
                  style={{
                    width: `${testData.completed > 0 ? (
                      (passedCount / testData.completed) *
                      100
                    ).toFixed(0) : 0}%`,
                  }}
                ></div>
              </div>
              <div className="mt-1 text-right text-sm font-semibold text-gray-900">
                {testData.completed > 0 ? ((passedCount / testData.completed) * 100).toFixed(1) : '0.0'}%
              </div>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Completion Status">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-gray-900">
                  {testData.completed}/{testData.totalStudents}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${parseFloat(completionRate) || 0}%` }}
                ></div>
              </div>
              <div className="mt-1 text-right text-sm font-semibold text-gray-900">
                {completionRate}%
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

      <ComponentCard title="Student Performance">
        <div className="mb-6 flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab("all")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              selectedTab === "all"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            All Students ({students.length})
          </button>
          <button
            onClick={() => setSelectedTab("completed")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              selectedTab === "completed"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Completed ({testData.completed})
          </button>
          <button
            onClick={() => setSelectedTab("pending")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              selectedTab === "pending"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending ({testData.pending})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Attempts
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Time Spent
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Completed At
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      color={
                        student.status === "completed" ? "success" : "warning"
                      }
                    >
                      {student.status === "completed" ? "Completed" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    {student.score !== null ? (
                      <span
                        className={`text-sm font-semibold ${
                          student.score >= testData.passingScore
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {student.score}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">
                      {student.attempts}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {student.timeSpent !== null ? (
                      <span className="text-sm text-gray-700">
                        {student.timeSpent} min
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {student.completedAt ? (
                      <span className="text-sm text-gray-700">
                        {student.completedAt}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Not completed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {student.passed !== null ? (
                      student.passed ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Pass</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Fail</span>
                        </div>
                      )
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="bg-gray-50 py-12 text-center">
              <p className="text-gray-600">
                No students found in this category
              </p>
            </div>
          )}
        </div>
      </ComponentCard>
    </div>
  );
};

export default TestDetailsView;

