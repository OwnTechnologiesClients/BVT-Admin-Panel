"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import ChaptersTable from "@/components/chapters/ChaptersTable";

export default function ChaptersPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Chapters Management"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Chapters", href: "/chapters" }
        ]}
      />
      <ChaptersTable />
    </div>
  );
}
