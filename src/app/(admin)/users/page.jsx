import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { UsersTable } from "@/components/users";

export default function UsersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="View Users" />
      <UsersTable />
    </div>
  );
}
