"use client";

import React from "react";
import { Badge } from "@/components/ui";
import DataTable from "@/components/common/DataTable";

const EventsTable = () => {
  const events = [
    {
      id: 1,
      title: "Naval Engineering Conference 2024",
      type: "Conference",
      category: "Marine Engineering",
      startDate: "2024-03-15",
      endDate: "2024-03-17",
      startTime: "09:00",
      endTime: "17:00",
      location: "Naval Base San Diego",
      maxAttendees: 200,
      registeredAttendees: 156,
      status: "Upcoming",
      cost: "$500",
      organizer: "Commander James Rodriguez"
    },
    {
      id: 2,
      title: "Maritime Safety Workshop",
      type: "Workshop",
      category: "Maritime Safety",
      startDate: "2024-03-20",
      endDate: "2024-03-20",
      startTime: "08:00",
      endTime: "16:00",
      location: "Online",
      maxAttendees: 50,
      registeredAttendees: 45,
      status: "Upcoming",
      cost: "Free",
      organizer: "Captain Michael Thompson"
    },
    {
      id: 3,
      title: "Submarine Operations Training",
      type: "Training",
      category: "Submarine Operations",
      startDate: "2024-03-10",
      endDate: "2024-03-14",
      startTime: "07:00",
      endTime: "18:00",
      location: "Submarine Base Groton",
      maxAttendees: 30,
      registeredAttendees: 28,
      status: "Ongoing",
      cost: "$2,000",
      organizer: "Commander Lisa Chen"
    },
    {
      id: 4,
      title: "Navigation Systems Seminar",
      type: "Seminar",
      category: "Navigation",
      startDate: "2024-02-28",
      endDate: "2024-02-28",
      startTime: "10:00",
      endTime: "15:00",
      location: "Naval Academy Annapolis",
      maxAttendees: 100,
      registeredAttendees: 89,
      status: "Completed",
      cost: "$200",
      organizer: "Lieutenant Commander Alex Brown"
    },
    {
      id: 5,
      title: "Marine Engineering Symposium",
      type: "Symposium",
      category: "Marine Engineering",
      startDate: "2024-04-05",
      endDate: "2024-04-07",
      startTime: "08:30",
      endTime: "17:30",
      location: "MIT Cambridge",
      maxAttendees: 150,
      registeredAttendees: 134,
      status: "Upcoming",
      cost: "$750",
      organizer: "Professor Sarah Johnson"
    }
  ];

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
          "Symposium": "info"
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
      render: (value, item) => (
        <div>
          <p className="font-medium">{value}/{item.maxAttendees}</p>
          <p className="text-sm text-gray-600">
            {Math.round((value / item.maxAttendees) * 100)}% filled
          </p>
        </div>
      )
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
      options: ["Conference", "Workshop", "Training", "Seminar", "Symposium"]
    },
    {
      key: "status",
      label: "Status",
      options: ["Upcoming", "Ongoing", "Completed", "Cancelled"]
    },
    {
      key: "category",
      label: "Category",
      options: ["Marine Engineering", "Navigation", "Maritime Safety", "Naval Operations", "Submarine Operations"]
    }
  ];

  const stats = [
    {
      label: "Total Events",
      value: events.length,
      icon: "📅",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Upcoming Events",
      value: events.filter(e => e.status === "Upcoming").length,
      icon: "⏰",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      color: "text-yellow-600"
    },
    {
      label: "Total Attendees",
      value: events.reduce((sum, event) => sum + event.registeredAttendees, 0),
      icon: "👥",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      label: "Avg. Capacity",
      value: `${Math.round(events.reduce((sum, event) => sum + (event.registeredAttendees / event.maxAttendees), 0) / events.length * 100)}%`,
      icon: "📊",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  const handleAdd = () => {
    window.location.href = "/admin/events/add";
  };

  const handleEdit = (event) => {
    window.location.href = `/admin/events/update/${event.id}`;
  };

  const handleDelete = (event) => {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      console.log("Delete event:", event);
    }
  };

  const handleView = (event) => {
    window.location.href = `/admin/events/details/${event.id}`;
  };

  return (
    <DataTable
      title="Events Management"
      description="Manage conferences, workshops, and training events"
      data={events}
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