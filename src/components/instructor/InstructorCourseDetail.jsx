"use client";

import React, { useMemo, useState } from "react";
import { ComponentCard } from "@/components/common/ComponentCard";
import { Badge, Button } from "@/components/ui";
import { instructorTests } from "@/data/instructorMockData";

const DetailTabs = ["Overview", "Students", "Schedule", "Assessments"];

const SectionHeader = ({ title, action }) => (
  <div className="flex items-center justify-between">
    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
      {title}
    </h3>
    {action}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/40 text-center">
    <span className="text-3xl">🛠️</span>
    <p className="text-sm font-medium text-gray-600">{message}</p>
    <p className="text-xs text-gray-400">
      This is a preview of the instructor experience. Backend integration will
      populate live data.
    </p>
  </div>
);

const OverviewTab = ({ overview }) => {
  if (!overview) {
    return <EmptyState message="Course overview data not available yet." />;
  }

  return (
    <div className="space-y-6">
      <ComponentCard title="Course Synopsis">
        <p className="text-sm leading-relaxed text-gray-700">
          {overview.description}
        </p>
      </ComponentCard>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ComponentCard title="Learning Objectives" className="space-y-3">
          {overview.objectives?.map((objective, index) => (
            <div
              key={objective}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <p className="text-xs font-semibold uppercase text-blue-500">
                Objective {index + 1}
              </p>
              <p className="mt-2 text-sm text-gray-700">{objective}</p>
            </div>
          ))}
        </ComponentCard>

        <ComponentCard title="Reference Materials" className="space-y-3">
          {overview.resources?.map((resource) => (
            <div
              key={resource.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {resource.name}
                </p>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  {resource.type}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  alert(
                    "Resource downloads are disabled in preview mode. Backend integration pending."
                  )
                }
              >
                View
              </Button>
            </div>
          ))}
        </ComponentCard>
      </div>
    </div>
  );
};

const StudentsTab = ({ students = [] }) => {
  if (!students.length) {
    return <EmptyState message="No student roster data to display yet." />;
  }

  return (
    <ComponentCard
      title="Student Roster"
      className="overflow-hidden p-0 border-gray-200"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Student", "Progress", "Attendance", "Status", "Last Active"].map(
                (header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50/60">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  <div className="font-semibold">{student.name}</div>
                  <div className="text-xs text-gray-500">{student.rank}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-32 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {student.progress}%
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {student.attendance}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Badge
                    color={
                      student.status === "On Track"
                        ? "success"
                        : student.status === "Watch List"
                        ? "warning"
                        : "default"
                    }
                  >
                    {student.status}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {student.lastActive
                    ? new Date(student.lastActive).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ComponentCard>
  );
};

const ScheduleTab = ({ schedule = [] }) => {
  if (!schedule.length) {
    return <EmptyState message="No schedule items planned yet." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {schedule.map((session) => {
        const sessionDate = new Date(session.date);
        return (
          <div
            key={session.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-lg/10"
          >
            <SectionHeader
              title={session.topic}
              action={
                <Badge color="default" className="capitalize">
                  {session.modality}
                </Badge>
              }
            />
            <p className="mt-3 text-sm text-gray-600">
              {sessionDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}{" "}
              • {sessionDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}{" "}
              • {session.duration}
            </p>
            <p className="mt-2 text-sm text-gray-500">{session.location}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() =>
                alert("Session editing is disabled in preview mode.")
              }
            >
              Edit Session
            </Button>
          </div>
        );
      })}
    </div>
  );
};

const AssessmentsTab = ({ courseId }) => {
  const relevantTests = useMemo(
    () => instructorTests.filter((test) => test.courseId === courseId),
    [courseId]
  );

  if (!relevantTests.length) {
    return <EmptyState message="No assessments linked to this course yet." />;
  }

  return (
    <div className="space-y-4">
      {relevantTests.map((test) => (
        <div
          key={test.id}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-lg/10"
        >
          <SectionHeader
            title={test.title}
            action={
              <Badge color={test.status === "Published" ? "success" : "warning"}>
                {test.status}
              </Badge>
            }
          />
          <p className="mt-2 text-sm text-gray-600">{test.courseTitle}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500 sm:grid-cols-4">
            <div>
              <p className="uppercase tracking-wide">Scheduled</p>
              <p className="mt-1 text-sm text-gray-900">
                {test.scheduledDate
                  ? new Date(test.scheduledDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "TBD"}
              </p>
            </div>
            <div>
              <p className="uppercase tracking-wide">Attempts</p>
              <p className="mt-1 text-sm text-gray-900">{test.attempts}</p>
            </div>
            <div>
              <p className="uppercase tracking-wide">Avg. Score</p>
              <p className="mt-1 text-sm text-gray-900">{test.averageScore}%</p>
            </div>
            <div>
              <p className="uppercase tracking-wide">Passing Score</p>
              <p className="mt-1 text-sm text-gray-900">{test.passingScore}%</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                alert("Preview mode: launching test builder coming soon.")
              }
            >
              Manage Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                alert("Preview mode: viewing submissions is not enabled yet.")
              }
            >
              View Submissions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                alert("Preview mode: duplication is not enabled yet.")
              }
            >
              Duplicate
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const InstructorCourseDetail = ({ course, detail }) => {
  const [activeTab, setActiveTab] = useState("Overview");

  if (!course) {
    return (
      <EmptyState message="Course not found in mock data. Try selecting a different course." />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge color="info" className="uppercase tracking-wide">
              {course.level}
            </Badge>
            <h1 className="mt-3 text-2xl font-semibold text-gray-900">
              {course.title}
            </h1>
            <p className="text-sm text-gray-500">Course Code • {course.code}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-gray-200 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Enrolled
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {course.students}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Progress
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {course.progress}%
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Modality
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {course.modality}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span>
            {new Date(course.startDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            –{" "}
            {new Date(course.endDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="h-5 w-px bg-gray-200" />
          <span>Status: {course.status}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {DetailTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Overview" && (
        <OverviewTab overview={detail?.overview} />
      )}
      {activeTab === "Students" && (
        <StudentsTab students={detail?.students} />
      )}
      {activeTab === "Schedule" && (
        <ScheduleTab schedule={detail?.schedule} />
      )}
      {activeTab === "Assessments" && (
        <AssessmentsTab courseId={course.id} />
      )}
    </div>
  );
};

export default InstructorCourseDetail;


