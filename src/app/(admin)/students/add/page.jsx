"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { StudentForm } from "@/components/students";

const AddStudentPage = () => {
  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle="Add Student"
        trail={[
          { label: "Students", href: "/students" },
          { label: "Add Student" },
        ]}
      />
      <StudentForm />
    </div>
  );
};

export default AddStudentPage;

