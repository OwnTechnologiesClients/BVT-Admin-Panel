"use client";

import React from "react";
import { ComponentCard } from "@/components/common/ComponentCard";
import { Badge } from "@/components/ui";

const StatCard = ({ label, value, helper, color = "text-gray-900" }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-lg/10">
    <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
    <p className={`mt-3 text-2xl font-semibold ${color}`}>{value}</p>
    {helper && <p className="mt-2 text-xs text-gray-500">{helper}</p>}
  </div>
);

const StudentCourseProgress = ({ student, course }) => {
  if (!student || !course) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-gray-600">
        Course data not found for this student.
      </div>
    );
  }

  const modulesRemaining = Math.max(
    (course.totalModules || 0) - (course.modulesCompleted || 0),
    0
  );

  return (
    <div className="space-y-6">
      <ComponentCard title="Course Overview">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {course.title}
            </p>
            <p className="text-sm text-gray-500">
              {course.category} • {course.instructor}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Enrolled{" "}
              {new Date(course.enrollmentDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge color="info">{student.fullName}</Badge>
            <Badge>{student.rank}</Badge>
            <Badge color={course.status === "Completed" ? "success" : "warning"}>
              {course.status}
            </Badge>
          </div>
        </div>
        <div className="mt-4 h-3 rounded-full bg-gray-100">
          <div
            className="h-3 rounded-full bg-blue-500 transition-all"
            style={{ width: `${course.progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {course.progress}% complete • Last active{" "}
          {course.lastActive
            ? new Date(course.lastActive).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : "No activity recorded"}
        </p>
      </ComponentCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Modules Completed"
          value={`${course.modulesCompleted ?? 0}/${course.totalModules ?? 0}`}
          helper={`${modulesRemaining} remaining`}
        />
        <StatCard
          label="Progress"
          value={`${course.progress}%`}
          helper="Based on modules completed"
          color="text-blue-600"
        />
        <StatCard
          label="Next Milestone"
          value={course.nextMilestone || "Not scheduled"}
        />
        <StatCard
          label="Status"
          value={course.status}
          color={
            course.status === "Completed"
              ? "text-green-600"
              : course.status === "In Progress"
              ? "text-blue-600"
              : "text-yellow-600"
          }
        />
      </div>

      <ComponentCard title="Activity Timeline" className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Latest Interaction
              </p>
              <p className="text-xs text-gray-500">
                {course.lastActive
                  ? new Date(course.lastActive).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "No activity recorded"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Modules Completed
              </p>
              <p className="text-xs text-gray-500">
                {course.modulesCompleted ?? 0} of {course.totalModules ?? 0} modules
                finished
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-yellow-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Next Milestone
              </p>
              <p className="text-xs text-gray-500">
                {course.nextMilestone || "None scheduled"}
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
};

export default StudentCourseProgress;

