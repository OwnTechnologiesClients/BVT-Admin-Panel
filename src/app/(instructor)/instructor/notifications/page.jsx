"use client";

import React, { useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/common";
import DataTable from "@/components/common/DataTable";
import StudentQueryModal from "@/components/common/StudentQueryModal";
import {
  instructorQueries as initialQueries,
} from "@/data/instructorMockData";
import { Badge } from "@/components/ui";

const priorityColors = {
  Critical: "error",
  High: "warning",
  Medium: "info",
  Low: "default",
};

const statusColors = {
  Open: "info",
  "In Progress": "warning",
  "Waiting on Student": "default",
  Resolved: "success",
};

const InstructorNotificationsPage = () => {
  const [queries, setQueries] = useState(initialQueries);
  const [selectedQueryId, setSelectedQueryId] = useState(
    initialQueries[0]?.id ?? null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedQuery = useMemo(
    () => queries.find((query) => query.id === selectedQueryId) ?? null,
    [queries, selectedQueryId]
  );

  const columns = [
    {
      key: "studentName",
      label: "Student",
      render: (value, item) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{item.studentEmail}</p>
        </div>
      ),
    },
    {
      key: "course",
      label: "Course",
      render: (value) => <span className="text-sm text-gray-700">{value}</span>,
    },
    {
      key: "subject",
      label: "Subject",
      render: (value) => (
        <span className="text-sm text-gray-700 line-clamp-1">{value}</span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (value) => (
        <Badge color={priorityColors[value] || "default"}>{value}</Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge color={statusColors[value] || "default"}>{value}</Badge>
      ),
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      render: (value) =>
        new Date(value).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
    },
  ];

  const filters = [
    {
      key: "status",
      label: "Status",
      options: ["Open", "In Progress", "Waiting on Student", "Resolved"],
    },
    {
      key: "priority",
      label: "Priority",
      options: ["Critical", "High", "Medium", "Low"],
    },
  ];

  const stats = [
    {
      label: "Active Queries",
      value: queries.length,
      icon: "💬",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "High Priority",
      value: queries.filter((q) => q.priority === "High").length,
      icon: "⚠️",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      label: "Open",
      value: queries.filter((q) => q.status === "Open").length,
      icon: "📬",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Waiting on You",
      value: queries.filter((q) => q.status === "In Progress").length,
      icon: "⏳",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  const handleView = (query) => {
    setSelectedQueryId(query.id);
    setIsModalOpen(true);
  };

  const handleSendReply = (messageContent) => {
    if (!selectedQuery || !messageContent) return;
    const newMessage = {
      id: `msg-${Date.now()}`,
      authorRole: "admin",
      authorName: selectedQuery.assignedInstructor || "Instructor",
      timestamp: new Date().toISOString(),
      content: messageContent,
    };

    setQueries((prev) =>
      prev.map((query) =>
        query.id === selectedQuery.id
          ? {
              ...query,
              status: "In Progress",
              lastUpdated: newMessage.timestamp,
              messages: [...query.messages, newMessage],
            }
          : query
      )
    );
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle="Student Queries"
        homeHref="/instructor"
        homeLabel="Instructor Dashboard"
        trail={[{ label: "Notifications" }]}
      />

      <DataTable
        title="Active Conversations"
        description="Review and respond to questions from your enrolled students."
        data={queries}
        columns={columns}
        filters={filters}
        stats={stats}
        searchPlaceholder="Search queries by student, subject, or course..."
        onView={handleView}
      />

      <StudentQueryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        query={selectedQuery}
        onSendReply={handleSendReply}
      />
    </div>
  );
};

export default InstructorNotificationsPage;

