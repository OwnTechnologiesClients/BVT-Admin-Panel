import React from "react";
import { PageBreadcrumb, ComponentCard } from "@/components/common";
import { MultiStepTestForm } from "@/components/tests";

const AddTestPage = () => {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/" },
    { label: "Tests", href: "/tests" },
    { label: "Create Test", href: "/tests/add" },
  ];

  return (
    <div className="space-y-6">
      <PageBreadcrumb items={breadcrumbItems} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Test</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create a new test with questions for your course
          </p>
        </div>
      </div>

      <ComponentCard title="Test Information">
        <MultiStepTestForm />
      </ComponentCard>
    </div>
  );
};

export default AddTestPage;


