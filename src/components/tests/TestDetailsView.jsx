"use client";

import React, { useMemo, useState } from "react";
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
  Download,
  Mail,
  TrendingUp,
  AlertCircle,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";

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
  const [testData] = useState(() => defaultTestData(testId));
  const [selectedTab, setSelectedTab] = useState("completed");
  const [resultsReleased, setResultsReleased] = useState(false);
  const [students] = useState(defaultStudents);

  const filteredStudents = useMemo(() => {
    if (selectedTab === "all") return students;
    return students.filter((student) => student.status === selectedTab);
  }, [selectedTab, students]);

  const passedCount = students.filter((s) => s.passed === true).length;
  const failedCount = students.filter(
    (s) => s.status === "completed" && s.passed === false
  ).length;
  const completionRate = (
    (testData.completed / testData.totalStudents) *
    100
  ).toFixed(1);

  const handleEditQuestions = () => {
    router.push(`${basePath}/${testId}/questions/edit`);
  };

  const handleViewQuestions = () => {
    router.push(`${basePath}/${testId}/questions/view`);
  };

  const handleExport = () => {
    alert("Preview mode: export functionality will be enabled with backend.");
  };

  const handleNotifyPending = () => {
    alert(
      "Preview mode: notifications will be enabled once communication services are connected."
    );
  };

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
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Results
          </Button>
          <Button
            variant="outline"
            onClick={handleNotifyPending}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Notify Pending
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
              {((testData.pending / testData.totalStudents) * 100).toFixed(0)}%
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
            {testData.averageScore.toFixed(1)}%
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
                {testData.createdAt}
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
                {testData.highestScore}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Score</span>
              <span className="text-lg font-bold text-blue-600">
                {testData.averageScore.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lowest Score</span>
              <span className="text-lg font-bold text-red-600">
                {testData.lowestScore}%
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
                    width: `${(
                      (passedCount / testData.completed) *
                      100
                    ).toFixed(0)}%`,
                  }}
                ></div>
              </div>
              <div className="mt-1 text-right text-sm font-semibold text-gray-900">
                {((passedCount / testData.completed) * 100).toFixed(1)}%
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
                  style={{ width: `${completionRate}%` }}
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

