import React from "react";
import { ComponentCard, PageBreadcrumb } from "@/components/common";
import { MultiStepProgramForm } from "@/components/programs";

export default function AddProgramPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Program" />
      <div className="space-y-6">
        <ComponentCard title="Create New Program">
          <MultiStepProgramForm />
        </ComponentCard>
      </div>
    </div>
  );
}
