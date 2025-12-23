"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { PageBreadcrumb } from "@/components/common";
import DataTable from "@/components/common/DataTable";
import StudentQueryModal from "@/components/common/StudentQueryModal";
import { Badge } from "@/components/ui";
import * as queryAPI from "@/lib/api/studentQuery";

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
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQueryId, setSelectedQueryId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch queries from API
  const fetchQueries = useCallback(async (page = 1, limit = 10, status = null, search = "") => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (status && status !== "") params.status = status.toLowerCase();
      if (search) params.search = search;
      
      const response = await queryAPI.getAllQueries(params);
      if (response.success && response.data) {
        const backendQueries = response.data.queries || [];
        // Map backend data to frontend format
        const mappedQueries = backendQueries.map((query) => ({
          id: query._id,
          _id: query._id,
          studentName: query.studentId?.fullName || "Unknown Student",
          studentEmail: query.studentId?.email || "",
          course: query.courseId?.title || "Unknown Course",
          courseId: query.courseId?._id || query.courseId,
          assignedInstructor: query.assignedTo?.userId
            ? `${query.assignedTo.userId.firstName || ""} ${query.assignedTo.userId.lastName || ""}`.trim() || "Unassigned"
            : "Unassigned",
          subject: query.subject,
          priority: "Medium", // Backend doesn't have priority, defaulting to Medium
          status: query.status ? query.status.charAt(0).toUpperCase() + query.status.slice(1) : "Open",
          lastUpdated: query.lastUpdated || query.updatedAt || query.createdAt,
          submittedAt: query.createdAt,
          messages: (query.messages || []).map((msg) => ({
            id: msg._id || `msg-${Date.now()}-${Math.random()}`,
            authorRole: msg.sender === "student" ? "student" : "admin",
            authorName: msg.senderName || "Unknown",
            timestamp: msg.timestamp || new Date().toISOString(),
            content: msg.content,
            attachments: msg.attachments || []
          }))
        }));
        
        setQueries(mappedQueries);
        
        if (response.data.pagination) {
          setPagination({
            page: response.data.pagination.page || page,
            limit: response.data.pagination.limit || limit,
            total: response.data.pagination.total || 0,
            totalPages: response.data.pagination.pages || 0
          });
        }
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  // Handle search change from DataTable
  const handleSearchChange = useCallback((search) => {
    setSearchTerm(search);
    fetchQueries(1, pagination.limit, null, search);
  }, [fetchQueries, pagination.limit]);

  const selectedQuery = useMemo(
    () => queries.find((query) => query.id === selectedQueryId || query._id === selectedQueryId) ?? null,
    [queries, selectedQueryId]
  );

  const stats = useMemo(() => {
    const total = pagination.total || queries.length;
    const open = queries.filter((q) => q.status === "Open" || q.status === "open").length;
    const inProgress = queries.filter((q) => q.status === "In Progress" || q.status === "in progress").length;
    const resolved = queries.filter((q) => q.status === "Resolved" || q.status === "resolved").length;
    const closed = queries.filter((q) => q.status === "Closed" || q.status === "closed").length;

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
        label: "Resolved",
        value: resolved,
        icon: "✅",
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        label: "Closed",
        value: closed,
        icon: "🔒",
        bgColor: "bg-gray-100",
        iconColor: "text-gray-600",
      },
    ];
  }, [queries, pagination]);

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
      render: (value) => {
        const capitalizedStatus = value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "Open";
        return (
          <Badge color={statusColors[capitalizedStatus] || "default"}>{capitalizedStatus}</Badge>
        );
      },
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
      options: ["open", "resolved", "closed"],
    },
  ];

  const handleSelectQuery = (query) => {
    setSelectedQueryId(query.id || query._id);
    setIsModalOpen(true);
  };

  const handleSendReply = async (messageContent) => {
    // Refresh the query list to get updated data (message or status change)
    try {
      await fetchQueries(pagination.page, pagination.limit, currentStatus, searchTerm);
    } catch (error) {
      console.error("Error refreshing queries:", error);
    }
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
        pagination={pagination}
        onPageChange={(page) => fetchQueries(page, pagination.limit, null, searchTerm)}
        onPageSizeChange={(limit) => fetchQueries(1, limit, null, searchTerm)}
        onSearchChange={handleSearchChange}
        onFilterChange={(filters) => {
          const status = filters.status || null;
          setCurrentStatus(status);
          fetchQueries(1, pagination.limit, status, searchTerm);
        }}
        serverSide={true}
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

