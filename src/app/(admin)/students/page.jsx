"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { StudentsTable } from "@/components/students";

const StudentsPage = () => {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Students" />
      <StudentsTable />
    </div>
  );
};

export default StudentsPage;

