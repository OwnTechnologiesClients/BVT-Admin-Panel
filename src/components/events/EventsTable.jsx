"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import { Search, Filter, Eye, Edit, Trash2, Plus } from "lucide-react";
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
    // Mark initial mount as complete after a short delay to allow other effects to skip
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Explicit search trigger (type + Enter or button)
  const handleSearch = useCallback(() => {
    // Always reset to first page when searching
    fetchEvents(1, pagination.limit, searchTerm, statusFilter, typeFilter);
  }, [fetchEvents, pagination.limit, searchTerm, statusFilter, typeFilter]);

  // Handle filter changes - trigger API call immediately (not search)
  const prevFiltersRef = useRef({ statusFilter, typeFilter });
  useEffect(() => {
    // Skip on initial mount - initial fetch already handles this
    if (isInitialMount.current) {
      return;
    }

    // Only trigger if filters actually changed (not search)
    if (prevFiltersRef.current.statusFilter !== statusFilter || 
        prevFiltersRef.current.typeFilter !== typeFilter) {
      prevFiltersRef.current = { statusFilter, typeFilter };
      fetchEvents(1, pagination.limit, searchTerm, statusFilter, typeFilter);
    }
  }, [statusFilter, typeFilter, fetchEvents, pagination.limit, searchTerm]);

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
      registeredAttendees: event.registeredAttendees || 0, // This would need to come from registrations
      status: status,
      cost: cost,
      organizer: event.organizer || 'N/A'
    };
  };

  // Format events for display
  const formattedEvents = events.map(formatEvent);

  // Calculate stats from current events
  const totalEvents = pagination.total || formattedEvents.length;
  const upcomingCount = formattedEvents.filter(e => e.status === "Upcoming").length;
  const totalAttendees = formattedEvents.reduce((sum, event) => sum + event.registeredAttendees, 0);
  const avgCapacity = formattedEvents.length > 0
    ? `${Math.round(formattedEvents.reduce((sum, event) => {
        const max = event.maxAttendees || 1;
        return sum + (event.registeredAttendees / max);
      }, 0) / formattedEvents.length * 100)}%`
    : "0%";

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

  // Get unique types and statuses from current events (for filter dropdown)
  const uniqueTypes = Array.from(
    new Set(formattedEvents.map(e => e.type).filter(Boolean))
  ).sort();

  const uniqueStatuses = Array.from(
    new Set(formattedEvents.map(e => e.status).filter(Boolean))
  ).sort();

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
    },
    {
      label: "Total Attendees",
      value: totalAttendees,
      icon: "👥",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      label: "Avg. Capacity",
      value: avgCapacity,
      icon: "📊",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color || 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-8 h-8 ${stat.bgColor || 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                  <span className={`${stat.iconColor || 'text-blue-600'} font-semibold`}>
                    {stat.icon}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters and Search - Matching MyCourses pattern */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Events</h2>
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Event
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events by title, organizer, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            {uniqueTypes.length > 0 && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading events...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : formattedEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No events found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {columns.map((column, index) => (
                      <th key={index} className="text-left py-3 px-4 font-medium text-gray-700">
                        {column.label}
                      </th>
                    ))}
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formattedEvents.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                      {columns.map((column, colIndex) => (
                        <td key={colIndex} className="py-4 px-4">
                          {column.render ? column.render(item[column.key], item) : item[column.key]}
                        </td>
                      ))}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left side: Items info and page size selector */}
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
                    <span className="font-medium">{pagination.total}</span> items
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Show:</label>
                    <select
                      value={pagination.limit}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                {/* Right side: Page navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[2.5rem] px-3 py-1 border rounded-md text-sm ${
                            pageNum === pagination.page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsTable;
