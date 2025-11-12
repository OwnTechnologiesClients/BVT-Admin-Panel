"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { ComponentCard } from "@/components/common/ComponentCard";
import { useAuth } from "@/context/AuthContext";

export default function InstructorProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle="Instructor Profile"
        homeHref="/instructor"
        homeLabel="Instructor Dashboard"
        trail={[{ label: "Profile" }]}
      />
      <ComponentCard title="Profile Overview">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">
              Preview Data
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500">{user.title}</p>
          </div>
          <div className="rounded-full bg-blue-200 px-6 py-3 text-sm font-semibold text-blue-700">
            {user.email}
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Instructor profile editing, certifications, and availability tools
          will appear here. For now this page provides a glimpse of the intended
          layout using mock data from the preview auth context.
        </p>
      </ComponentCard>
    </div>
  );
}

