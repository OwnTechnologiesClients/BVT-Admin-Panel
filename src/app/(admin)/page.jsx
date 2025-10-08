import React from "react";
import { TrainingMetrics, RecentCourses } from "@/components/dashboard";

export default function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6">
        <TrainingMetrics />
      </div>
      <div className="col-span-12">
        <RecentCourses />
      </div>
    </div>
  );
}
