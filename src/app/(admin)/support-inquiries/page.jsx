"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { PageBreadcrumb } from "@/components/common";
import DataTable from "@/components/common/DataTable";
import SupportInquiryModal from "@/components/inquiries/SupportInquiryModal";
import { Badge } from "@/components/ui";
import * as inquiryAPI from "@/lib/api/inquiry";

const statusColors = {
  new: "info",
  "in-progress": "warning",
  resolved: "success",
  closed: "default",
};

const inquiryTypeLabels = {
  general: "General Inquiry",
  courses: "Course Information",
  enrollment: "Enrollment Support",
  technical: "Technical Support",
  certification: "Certification",
  events: "Events & Workshops",
};

const AdminSupportInquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch inquiries from API
  const fetchInquiries = useCallback(async (page = 1, limit = 10, status = null, inquiryType = null, search = null) => {
    try {
      setLoading(true);
      const params = { 
        page, 
        limit,
        sort_column: 'createdAt',
        sort_direction: 'desc' // Latest first
      };
      if (status && status !== "") params.status = status;
      if (inquiryType && inquiryType !== "") params.inquiryType = inquiryType;
      if (search && search !== "") params.search = search;
      
      const response = await inquiryAPI.getAllInquiries(params);
      if (response.success && response.data) {
        const backendInquiries = Array.isArray(response.data) ? response.data : [];
        // Map backend data to frontend format
        const mappedInquiries = backendInquiries.map((inquiry) => ({
          id: inquiry._id,
          _id: inquiry._id,
          fullName: inquiry.fullName,
          email: inquiry.email,
          phone: inquiry.phone || "N/A",
          inquiryType: inquiry.inquiryType || "general",
          message: inquiry.message,
          status: inquiry.status || "new",
          createdAt: inquiry.createdAt,
          updatedAt: inquiry.updatedAt,
        }));
        
        setInquiries(mappedInquiries);
        
        if (response.pagination) {
          setPagination({
            page: response.pagination.page || page,
            limit: response.pagination.limit || limit,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0
          });
        } else {
          // Fallback pagination if not provided
          setPagination({
            page,
            limit,
            total: mappedInquiries.length,
            totalPages: 1
          });
        }
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const selectedInquiry = useMemo(
    () => inquiries.find((inquiry) => inquiry.id === selectedInquiryId || inquiry._id === selectedInquiryId) ?? null,
    [inquiries, selectedInquiryId]
  );

  const stats = useMemo(() => {
    const total = pagination.total || inquiries.length;
    const newCount = inquiries.filter((q) => q.status === "new").length;
    const inProgress = inquiries.filter((q) => q.status === "in-progress").length;
    const resolved = inquiries.filter((q) => q.status === "resolved").length;
    const closed = inquiries.filter((q) => q.status === "closed").length;

    return [
      {
        label: "Total Inquiries",
        value: total,
        icon: "📨",
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        label: "New",
        value: newCount,
        icon: "🟢",
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
      },
      {
        label: "In Progress",
        value: inProgress,
        icon: "🟡",
        bgColor: "bg-yellow-100",
        iconColor: "text-yellow-600",
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
  }, [inquiries, pagination]);

  const columns = [
    {
      key: "fullName",
      label: "Name",
      render: (value, item) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (value) => (
        <span className="text-sm text-gray-700">{value}</span>
      ),
    },
    {
      key: "inquiryType",
      label: "Type",
      render: (value) => (
        <span className="text-sm text-gray-700">{inquiryTypeLabels[value] || value}</span>
      ),
    },
    {
      key: "message",
      label: "Message",
      render: (value) => (
        <span className="text-sm text-gray-700 line-clamp-2">{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const status = value || "new";
        const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
        return (
          <Badge color={statusColors[status] || "default"}>{capitalizedStatus}</Badge>
        );
      },
    },
    {
      key: "createdAt",
      label: "Submitted",
      render: (value) =>
        new Date(value).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
    },
  ];

  const filters = [
    {
      key: "status",
      label: "Status",
      options: ["new", "in-progress", "resolved", "closed"],
    },
    {
      key: "inquiryType",
      label: "Type",
      options: ["general", "courses", "enrollment", "technical", "certification", "events"],
    },
  ];

  const handleSelectInquiry = (inquiry) => {
    setSelectedInquiryId(inquiry.id || inquiry._id);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    // Refresh the inquiry list after status update
    try {
      await fetchInquiries(pagination.page, pagination.limit);
    } catch (error) {
      console.error("Error refreshing inquiries:", error);
    }
  };

  const handleSearch = (searchTerm) => {
    fetchInquiries(1, pagination.limit, null, null, searchTerm);
  };

  const handleFilterChange = (filters) => {
    const status = filters.status || null;
    const inquiryType = filters.inquiryType || null;
    fetchInquiries(1, pagination.limit, status, inquiryType);
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        pageTitle="Support Inquiries"
        homeHref="/"
        homeLabel="Dashboard"
        trail={[{ label: "Support Inquiries" }]}
      />

      <DataTable
        title="Support Inquiries"
        description="Manage and respond to inquiries submitted through the contact form and inquiry modal."
        data={inquiries}
        columns={columns}
        stats={stats}
        filters={filters}
        searchPlaceholder="Search by name, email, or message..."
        onView={handleSelectInquiry}
        pagination={pagination}
        onPageChange={(page) => fetchInquiries(page, pagination.limit)}
        onPageSizeChange={(limit) => fetchInquiries(1, limit)}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearch}
        serverSide={true}
      />

      <SupportInquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        inquiry={selectedInquiry}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default AdminSupportInquiriesPage;

