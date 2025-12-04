"use client";

import React from "react";
import { ComponentCard } from "@/components/common/ComponentCard";
import { Badge } from "@/components/ui";
import { instructorDashboardSummary } from "@/data/instructorMockData";

const MetricCard = ({ metric }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-lg/10">
    <div className="flex items-center justify-between">
      <span className="text-2xl">{metric.icon}</span>
      <span className={`text-xs font-medium uppercase ${metric.color}`}>
        {metric.trend}
      </span>
    </div>
    <h4 className="mt-4 text-sm font-medium text-gray-500">{metric.label}</h4>
    <p className="mt-2 text-3xl font-semibold text-gray-900">{metric.value}</p>
  </div>
);

const SessionCard = ({ session }) => {
  const sessionDate = new Date(session.date);
  return (
    <div className="rounded-xl border border-gray-200 p-4 hover:border-blue-200 transition-colors bg-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{session.title}</p>
          <p className="text-sm text-gray-600">{session.course}</p>
          <p className="mt-2 text-xs text-gray-500">
            {sessionDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}{" "}
            •{" "}
            {sessionDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            ({session.modality})
          </p>
        </div>
        <Badge color="default">{session.students} students</Badge>
      </div>
      <p className="mt-3 text-xs uppercase tracking-wide text-gray-400">
        Location
      </p>
      <p className="text-sm text-gray-700">{session.location}</p>
    </div>
  );
};

const StudentHighlight = ({ student }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-900">{student.name}</p>
      </div>
      <Badge color={student.status === "On Track" ? "success" : "warning"}>
        {student.status}
      </Badge>
    </div>
    <p className="mt-3 text-sm text-gray-600">{student.course}</p>
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs font-medium text-gray-500">
        <span>Progress</span>
        <span>{student.progress}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${student.progress}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Attendance: {student.attendance || "N/A"} • Last active{" "}
        {student.lastActive
          ? new Date(student.lastActive).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "—"}
      </p>
    </div>
  </div>
);

export const InstructorDashboard = () => {
  const { metrics, upcomingSessions, studentHighlights, announcements } =
    instructorDashboardSummary;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ComponentCard
          title="Upcoming Sessions"
          className="lg:col-span-2 space-y-3"
        >
          {upcomingSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </ComponentCard>

        <ComponentCard title="Student Highlights" className="space-y-3">
          {studentHighlights.map((student) => (
            <StudentHighlight key={student.id} student={student} />
          ))}
        </ComponentCard>
      </div>

      <ComponentCard title="Announcements" className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
          >
            <p className="text-sm font-semibold text-gray-900">
              {announcement.title}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              {announcement.message}
            </p>
            <p className="mt-3 text-xs text-gray-400 uppercase tracking-wide">
              {new Date(announcement.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        ))}
      </ComponentCard>
    </div>
  );
};

export default InstructorDashboard;


