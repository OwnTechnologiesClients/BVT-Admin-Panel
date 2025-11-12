"use client";

import React, { useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/common";
import DataTable from "@/components/common/DataTable";
import StudentQueryModal from "@/components/common/StudentQueryModal";
import { Badge } from "@/components/ui";

const mockQueries = [
  {
    id: "qry-001",
    studentName: "Lt. Marcus Allen",
    studentEmail: "marcus.allen@navy.mil",
    course: "Navigation Systems & GPS",
    assignedInstructor: "Cmdr. Sarah Johnson",
    subject: "Clarification on satellite drift calculations",
    priority: "High",
    status: "Open",
    lastUpdated: "2025-11-10T13:20:00Z",
    submittedAt: "2025-11-10T09:15:00Z",
    messages: [
      {
        id: "msg-001",
        authorRole: "student",
        authorName: "Lt. Marcus Allen",
        timestamp: "2025-11-10T09:15:00Z",
        content:
          "Good morning, sir. Could you please clarify how we compensate for satellite drift when plotting an approach in heavy weather?",
      },
      {
        id: "msg-002",
        authorRole: "admin",
        authorName: "Cmdr. Sarah Johnson",
        timestamp: "2025-11-10T12:05:00Z",
        content:
          "Great question, Marcus. We will cover this in tomorrow's lab, but I'll share an excerpt from the manual shortly.",
      },
    ],
  },
  {
    id: "qry-002",
    studentName: "Ens. Priya Sharma",
    studentEmail: "priya.sharma@navy.mil",
    course: "Maritime Security Operations",
    assignedInstructor: "Lt. Cmdr. Ethan Brooks",
    subject: "Assessment availability",
    priority: "Medium",
    status: "Waiting on Student",
    lastUpdated: "2025-11-09T17:42:00Z",
    submittedAt: "2025-11-09T14:02:00Z",
    messages: [
      {
        id: "msg-003",
        authorRole: "student",
        authorName: "Ens. Priya Sharma",
        timestamp: "2025-11-09T14:02:00Z",
        content:
          "Will the tactical assessment remain open over the weekend? I'm deployed Saturday morning.",
      },
      {
        id: "msg-004",
        authorRole: "admin",
        authorName: "Lt. Cmdr. Ethan Brooks",
        timestamp: "2025-11-09T17:42:00Z",
        content:
          "Hi Priya, yes—it will remain available until Monday 1800 hrs. Let us know if you hit any issues.",
      },
    ],
  },
  {
    id: "qry-003",
    studentName: "Lt. Naomi Fitzgerald",
    studentEmail: "naomi.fitzgerald@navy.mil",
    course: "Submarine Operations Masterclass",
    assignedInstructor: "Capt. Linda Perez",
    subject: "Simulator login issue",
    priority: "Critical",
    status: "In Progress",
    lastUpdated: "2025-11-11T08:05:00Z",
    submittedAt: "2025-11-11T07:48:00Z",
    messages: [
      {
        id: "msg-005",
        authorRole: "student",
        authorName: "Lt. Naomi Fitzgerald",
        timestamp: "2025-11-11T07:48:00Z",
        content:
          "I'm unable to authenticate into the submerged maneuver simulator. It errors with 'token expired'.",
      },
    ],
  },
];

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

const AdminNotificationsPage = () => {
  const [queries, setQueries] = useState(mockQueries);
  const [selectedQueryId, setSelectedQueryId] = useState(
    mockQueries[0]?.id ?? null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedQuery = useMemo(
    () => queries.find((query) => query.id === selectedQueryId) ?? null,
    [queries, selectedQueryId]
  );

  const stats = useMemo(() => {
    const total = queries.length;
    const open = queries.filter((q) => q.status === "Open").length;
    const inProgress = queries.filter((q) => q.status === "In Progress").length;
    const waiting = queries.filter(
      (q) => q.status === "Waiting on Student"
    ).length;

    return [
      {
        label: "Total Queries",
        value: total,
        icon: "📨",
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        label: "Open",
        value: open,
        icon: "🟢",
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
      },
      {
        label: "In Progress",
        value: inProgress,
        icon: "🛠️",
        bgColor: "bg-yellow-100",
        iconColor: "text-yellow-600",
      },
      {
        label: "Waiting on Student",
        value: waiting,
        icon: "⏳",
        bgColor: "bg-purple-100",
        iconColor: "text-purple-600",
      },
    ];
  }, [queries]);

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
      key: "assignedInstructor",
      label: "Instructor",
      render: (value) => (
        <span className="text-sm font-medium text-gray-800">{value}</span>
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

  const handleSelectQuery = (query) => {
    setSelectedQueryId(query.id);
    setIsModalOpen(true);
  };

  const handleSendReply = (messageContent) => {
    if (!selectedQuery || !messageContent) return;
    const newMessage = {
      id: `msg-${Date.now()}`,
      authorRole: "admin",
      authorName: "Admin Respondent",
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
        homeHref="/"
        homeLabel="Dashboard"
        trail={[{ label: "Notifications" }]}
      />

      <DataTable
        title="Student Support Inbox"
        description="Review and respond to questions raised during active courses."
        data={queries}
        columns={columns}
        stats={stats}
        filters={filters}
        searchPlaceholder="Search by student, course, or subject..."
        onView={handleSelectQuery}
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

export default AdminNotificationsPage;

