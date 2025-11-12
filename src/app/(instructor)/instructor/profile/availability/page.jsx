"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { ComponentCard } from "@/components/common/ComponentCard";
import { Button } from "@/components/ui";

const mockAvailability = [
  { day: "Monday", start: "09:00", end: "17:00", available: true },
  { day: "Tuesday", start: "09:00", end: "17:00", available: true },
  { day: "Wednesday", start: "09:00", end: "17:00", available: true },
  { day: "Thursday", start: "09:00", end: "17:00", available: true },
  { day: "Friday", start: "09:00", end: "16:00", available: true },
  { day: "Saturday", start: "09:00", end: "12:00", available: false },
  { day: "Sunday", start: "Off", end: "Off", available: false },
];

export default function InstructorAvailabilityPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle="Availability"
        homeHref="/instructor"
        homeLabel="Instructor Dashboard"
        trail={[
          { label: "Profile", href: "/instructor/profile" },
          { label: "Availability" },
        ]}
      />
      <ComponentCard title="Weekly Availability" className="space-y-4">
        <p className="text-sm text-gray-600">
          Availability management will be integrated with calendar sync once the
          backend is ready. This mock table visualises the planned layout.
        </p>
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Day
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Start
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  End
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Available
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {mockAvailability.map((entry) => (
                <tr key={entry.day} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {entry.day}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{entry.start}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{entry.end}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        entry.available
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {entry.available ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            alert(
              "Preview mode: editing availability will be enabled once the backend is ready."
            )
          }
        >
          Edit Availability
        </Button>
      </ComponentCard>
    </div>
  );
}

