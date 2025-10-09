import React from "react";
import { PageBreadcrumb, ComponentCard } from "@/components/common";
import { TestsTable } from "@/components/tests";

const TestsPage = () => {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/" },
    { label: "Tests", href: "/tests" },
  ];

  return (
    <div className="space-y-6">
      <PageBreadcrumb items={breadcrumbItems} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tests Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage all course tests and track student performance
          </p>
        </div>
      </div>

      <ComponentCard title="All Tests">
        <TestsTable />
      </ComponentCard>
    </div>
  );
};

export default TestsPage;


