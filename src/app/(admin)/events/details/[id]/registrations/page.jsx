"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Button } from "@/components/ui";
import EventRegistrationsTable from "@/components/events/EventRegistrationsTable";
import { ArrowLeft } from "lucide-react";

export default function EventRegistrationsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Event Registrations"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Events", href: "/events" },
          { label: "Event Details", href: `/events/details/${id}` },
          { label: "Registrations" }
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/events/details/${id}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event
        </Button>
      </div>

      <EventRegistrationsTable eventId={id} />
    </div>
  );
}

