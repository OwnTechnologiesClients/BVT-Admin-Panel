import React from "react";
import { ComponentCard, PageBreadcrumb } from "@/components/common";
import { MultiStepMentorForm } from "@/components/users";

export default function AddUserPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Mentor" />
      <div className="space-y-6">
        <ComponentCard title="Create New Mentor">
          <MultiStepMentorForm />
        </ComponentCard>
      </div>
    </div>
  );
}
