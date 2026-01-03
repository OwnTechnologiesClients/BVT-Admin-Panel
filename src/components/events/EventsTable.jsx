"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
import * as eventAPI from "@/lib/api/event";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";

const EventsTable = () => {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [upcomingCount, setUpcomingCount] = useState(0);
  const isInitialMount = useRef(true);
  const hasInitialFetch = useRef(false);

  // Fetch events with server-side pagination (Oasis pattern)
  // Supports lightweight search without triggering full table loading state
  const fetchEvents = useCallback(async (page, limit, search, status, type, options = {}) => {
    const { skipLoading = false } = options;
    try {
      if (!skipLoading) setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        sort_column: 'createdAt',
        sort_direction: 'desc',
        ...(search && { search }),
        ...(status && { status: status.toLowerCase() }),
        ...(type && { eventType: type })
      };

      const response = await eventAPI.getAllEvents(params);
      if (response.success) {
        setEvents(response.data || []);
        if (response.pagination) {
          setPagination({
            page: response.pagination.page || page,
            limit: response.pagination.limit || limit,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0
          });
        }
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      const errorMsg = err.message || 'Failed to fetch events';
      setError(errorMsg);
      showError('Error Loading Events', errorMsg);
    } finally {
      if (!skipLoading) setLoading(false);
    }
  }, []);

  // Initial fetch - only run once even in Strict Mode
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchEvents(1, 10, "", "", "");
    fetchUpcomingCount();
    // Mark initial mount as complete after a short delay to allow other effects to skip
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search change from DataTable
  const handleSearchChange = useCallback((search) => {
    setSearchTerm(search);
    fetchEvents(1, pagination.limit, search, statusFilter, typeFilter);
  }, [fetchEvents, pagination.limit, statusFilter, typeFilter]);

  // Handle filter change from DataTable
  const handleFilterChange = useCallback((filters) => {
    const newStatusFilter = filters.status || "";
    const newTypeFilter = filters.type || "";
    
    setStatusFilter(newStatusFilter);
    setTypeFilter(newTypeFilter);
    
    fetchEvents(1, pagination.limit, searchTerm, newStatusFilter, newTypeFilter);
  }, [fetchEvents, pagination.limit, searchTerm]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    fetchEvents(newPage, pagination.limit, searchTerm, statusFilter, typeFilter);
  }, [fetchEvents, pagination.limit, searchTerm, statusFilter, typeFilter]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    fetchEvents(1, newPageSize, searchTerm, statusFilter, typeFilter);
  }, [fetchEvents, searchTerm, statusFilter, typeFilter]);

  // Format event data for display
  const formatEvent = (event) => {
    const startDate = event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : 'N/A';
    const endDate = event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : 'N/A';
    
    // Determine status - use backend status if available, otherwise calculate from dates
    let status = "Upcoming";
    
    // Map backend status values to display values
    const statusMap = {
      'draft': 'Draft',
      'ongoing': 'Ongoing',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'published': 'Published'
    };
    
    // If backend has a status field, use it (but map it to display format)
    if (event.status && statusMap[event.status.toLowerCase()]) {
      status = statusMap[event.status.toLowerCase()];
    } else if (event.startDate && event.endDate) {
      // Fallback: Calculate status from dates if no status field or status is draft
      const now = new Date();
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      
      // Only calculate from dates if status is draft or missing
      if (!event.status || event.status.toLowerCase() === 'draft') {
        if (now > end) {
          status = "Completed";
        } else if (now >= start && now <= end) {
          status = "Ongoing";
        } else if (now < start) {
          status = "Upcoming";
        }
      }
    }

    // Format event type - handle both object and string cases
    let eventTypeValue = event.eventType;
    if (typeof event.eventType === 'object' && event.eventType !== null) {
      // If eventType is an object, try to get a meaningful value
      eventTypeValue = event.eventType.name || event.eventType.type || event.eventType._id || 'N/A';
    }
    
    const typeMap = {
      'conference': 'Conference',
      'workshop': 'Workshop',
      'training': 'Training',
      'seminar': 'Seminar',
      'meeting': 'Meeting',
      'competitions': 'Competitions',
      'drills and exercise': 'Drills and Exercise'
    };
    const type = typeMap[String(eventTypeValue).toLowerCase()] || (typeof eventTypeValue === 'string' ? eventTypeValue : 'N/A') || 'N/A';

    // Format cost
    const cost = event.cost === 0 || event.cost === null ? 'Free' : `$${event.cost}`;

    // Format category - handle both object and string cases
    let categoryName = 'N/A';
    if (event.category) {
      if (typeof event.category === 'string') {
        categoryName = event.category;
      } else if (typeof event.category === 'object' && event.category.name) {
        categoryName = event.category.name;
      } else if (typeof event.category === 'object' && event.category._id) {
        // If it's an object but no name, try to get a string representation
        categoryName = String(event.category._id);
      }
    }

    return {
      id: event._id,
      title: event.title,
      type: type,
      category: categoryName,
      startDate: startDate,
      endDate: endDate,
      startTime: event.startTime || 'N/A',
      endTime: event.endTime || 'N/A',
      location: event.isOnline ? 'Online' : (event.location || 'N/A'),
      maxAttendees: event.maxAttendees || 0,
      registeredAttendees: event.attendees?.length || 0,
      status: status,
      cost: cost,
      organizer: event.organizer || 'N/A'
    };
  };

  // Format events for display
  const formattedEvents = events.map(formatEvent);

  // Fetch upcoming events count from backend
  const fetchUpcomingCount = useCallback(async () => {
    try {
      const response = await eventAPI.getEventStats();
      if (response.success && response.data) {
        setUpcomingCount(response.data.upcomingEvents || 0);
      }
    } catch (err) {
      console.error('Error fetching upcoming events count:', err);
    }
  }, []);

  // Calculate stats from current events
  const totalEvents = pagination.total || formattedEvents.length;

  const columns = [
    {
      key: "title",
      label: "Event",
      render: (value, item) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{item.startDate} • {item.startTime}</p>
        </div>
      )
    },
    {
      key: "type",
      label: "Type",
      render: (value) => {
        const colors = {
          "Conference": "info",
          "Workshop": "warning",
          "Training": "success",
          "Seminar": "default",
          "Meeting": "info"
        };
        return <Badge color={colors[value] || "default"}>{value}</Badge>;
      }
    },
    {
      key: "category",
      label: "Category",
      render: (value) => <Badge color="default">{value}</Badge>
    },
    {
      key: "location",
      label: "Location"
    },
    {
      key: "registeredAttendees",
      label: "Attendees",
      render: (value, item) => {
        const max = item.maxAttendees || 1;
        const percentage = Math.round((value / max) * 100);
        return (
          <div>
            <p className="font-medium">{value}/{max}</p>
            <p className="text-sm text-gray-600">{percentage}% filled</p>
          </div>
        );
      }
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const colors = {
          "Upcoming": "info",
          "Ongoing": "warning",
          "Completed": "success",
          "Cancelled": "error",
          "Draft": "default",
          "Published": "info"
        };
        return <Badge color={colors[value] || "default"}>{value}</Badge>;
      }
    },
    {
      key: "cost",
      label: "Cost",
      render: (value) => <span className="font-medium">{value}</span>
    }
  ];

  const filters = [];

  const stats = [
    {
      label: "Total Events",
      value: totalEvents,
      icon: "📅",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Upcoming Events",
      value: upcomingCount,
      icon: "⏰",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      color: "text-yellow-600"
    }
  ];

  const handleAdd = () => {
    router.push("/events/add");
  };

  const handleEdit = (event) => {
    router.push(`/events/update/${event.id}`);
  };

  const handleDelete = async (event) => {
    const result = await showDeleteConfirm(
      `Delete "${event.title}"?`,
      'This action cannot be undone. All event data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
    try {
      const response = await eventAPI.deleteEvent(event.id);
      if (response.success) {
          showSuccess('Event Deleted!', `"${event.title}" has been deleted successfully.`);
        // Refresh current page
        await fetchEvents(pagination.page, pagination.limit, searchTerm, statusFilter, typeFilter);
        } else {
          showError('Delete Failed', response.message || 'Failed to delete event');
        }
      } catch (err) {
        showError('Error', err.message || 'Failed to delete event');
      }
    }
  };

  const handleView = (event) => {
    router.push(`/events/details/${event.id}`);
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading events...</p>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Events"
      data={formattedEvents}
      columns={columns}
      searchPlaceholder="Search events by title, organizer, or location..."
      filters={filters}
      stats={stats}
      pagination={pagination}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearchChange={handleSearchChange}
      onFilterChange={handleFilterChange}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      serverSide={true}
    />
  );
};

export default EventsTable;
