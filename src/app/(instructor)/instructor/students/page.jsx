"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { ComponentCard } from "@/components/common/ComponentCard";
import { courseDetailById } from "@/data/instructorMockData";
import { Badge } from "@/components/ui";

const aggregatedStudents = Object.values(courseDetailById)
  .flatMap((detail) => detail.students || [])
  .map((student, index) => ({ ...student, idx: index + 1 }));

export default function InstructorStudentsPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle="Student Roster"
        homeHref="/instructor"
        homeLabel="Instructor Dashboard"
      />
      <ComponentCard title="All Enrolled Students" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["#", "Name", "Rank", "Progress", "Status"].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {aggregatedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/60">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-400">
                    {student.idx}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                    {student.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {student.rank}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {student.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge
                      color={
                        student.status === "On Track"
                          ? "success"
                          : student.status === "Needs Review"
                          ? "warning"
                          : "default"
                      }
                    >
                      {student.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-600">
          Preview only: once the backend is connected, this view will aggregate
          student rosters from all courses linked to the instructor account.
        </p>
      </ComponentCard>
    </div>
  );
}

