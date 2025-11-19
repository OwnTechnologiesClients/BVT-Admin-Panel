"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";
import * as eventAPI from "@/lib/api/event";

const EventsTable = () => {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventAPI.getAllEvents({ limit: 100 });
      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Format event data for display
  const formatEvent = (event) => {
    const startDate = event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : 'N/A';
    const endDate = event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : 'N/A';
    
    // Determine status based on dates
    let status = "Upcoming";
    if (event.startDate && event.endDate) {
      const now = new Date();
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      if (now > end) {
        status = "Completed";
      } else if (now >= start && now <= end) {
        status = "Ongoing";
      }
    }

    // Format event type
    const typeMap = {
      'conference': 'Conference',
      'workshop': 'Workshop',
      'training': 'Training',
      'seminar': 'Seminar',
      'meeting': 'Meeting'
    };
    const type = typeMap[event.eventType] || event.eventType || 'N/A';

    // Format cost
    const cost = event.cost === 0 || event.cost === null ? 'Free' : `$${event.cost}`;

    return {
      id: event._id,
      title: event.title,
      type: type,
      category: event.category?.name || 'N/A',
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

  const formattedEvents = events.map(formatEvent);

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
          "Cancelled": "error"
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

  const filters = [
    {
      key: "type",
      label: "Event Type",
      options: ["Conference", "Workshop", "Training", "Seminar", "Meeting"]
    },
    {
      key: "status",
      label: "Status",
      options: ["Upcoming", "Ongoing", "Completed", "Cancelled"]
    }
  ];

  const stats = [
    {
      label: "Total Events",
      value: formattedEvents.length,
      icon: "📅",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Upcoming Events",
      value: formattedEvents.filter(e => e.status === "Upcoming").length,
      icon: "⏰",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      color: "text-yellow-600"
    },
    {
      label: "Total Attendees",
      value: formattedEvents.reduce((sum, event) => sum + event.registeredAttendees, 0),
      icon: "👥",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      label: "Avg. Capacity",
      value: formattedEvents.length > 0
        ? `${Math.round(formattedEvents.reduce((sum, event) => {
            const max = event.maxAttendees || 1;
            return sum + (event.registeredAttendees / max);
          }, 0) / formattedEvents.length * 100)}%`
        : "0%",
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
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return;
    }

    try {
      const response = await eventAPI.deleteEvent(event.id);
      if (response.success) {
        await fetchEvents();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete event');
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
    <DataTable
      title="Events Management"
      description="Manage conferences, workshops, and training events"
      data={formattedEvents}
      columns={columns}
      filters={filters}
      stats={stats}
      searchPlaceholder="Search events by title or organizer..."
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
    />
  );
};

export default EventsTable;
