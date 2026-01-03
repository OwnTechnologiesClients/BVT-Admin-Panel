"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageBreadcrumb, ComponentCard } from "@/components/common";
import { MultiStepTestForm } from "@/components/tests";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

const EditTestPage = () => {
  const params = useParams();
  const router = useRouter();
  const testId = params.id;

  const testData = {
    id: testId
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Edit Test"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Tests", href: "/tests" },
          { label: "Edit Test", href: `/tests/${testId}/edit` }
        ]}
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Test</h1>
          <p className="text-sm text-gray-600 mt-1">
            Update test information and questions
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/tests/${testId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Test Details
        </Button>
      </div>

      <ComponentCard title="Test Information">
        <MultiStepTestForm initialData={testData} isEdit={true} />
      </ComponentCard>
    </div>
  );
};

export default EditTestPage;

