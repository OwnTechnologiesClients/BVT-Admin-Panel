import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { TestsTable } from "@/components/tests";

const TestsPage = () => {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Tests Management" />
      <TestsTable />
    </div>
  );
};

export default TestsPage;


