"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { UsersTable } from "@/components/users";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Users Management" />
      <UsersTable />
    </div>
  );
}

