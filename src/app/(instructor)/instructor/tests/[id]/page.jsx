"use client";

import React from "react";
import { useParams } from "next/navigation";
import { TestDetailsView } from "@/components/tests";

const InstructorTestDetailsPage = () => {
  const params = useParams();
  const testId = params.id;

  return (
    <TestDetailsView
      testId={testId}
      basePath="/instructor/tests"
      breadcrumbProps={{
        homeHref: "/instructor",
        homeLabel: "Instructor Dashboard",
        trail: [{ label: "Assessments", href: "/instructor/tests" }],
      }}
      previewNotice="This view mirrors the upcoming instructor test workspace. All figures are mock data until the backend integration is complete."
    />
  );
};

export default InstructorTestDetailsPage;

