"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import CertificatesTable from "@/components/certificates/CertificatesTable";

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Certificates Dashboard" />
      <CertificatesTable />
    </div>
  );
}
