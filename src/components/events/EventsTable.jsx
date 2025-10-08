"use client";

import React, { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { Eye, Edit, Trash2, Plus, Filter, Search, Calendar, MapPin, Users } from "lucide-react";

const EventsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

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
      location: "Naval Base Norfolk",
      maxAttendees: 25,
      registeredAttendees: 25,
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
      endTime: "14:00",
      location: "Online",
      maxAttendees: 100,
      registeredAttendees: 89,
      status: "Completed",
      cost: "$150",
      organizer: "Lieutenant Commander Alex Brown"
    },
    {
      id: 5,
      title: "Naval Operations Strategy Meeting",
      type: "Meeting",
      category: "Naval Operations",
      startDate: "2024-03-25",
      endDate: "2024-03-25",
      startTime: "13:00",
      endTime: "17:00",
      location: "Pentagon Conference Room",
      maxAttendees: 30,
      registeredAttendees: 28,
      status: "Upcoming",
      cost: "Free",
      organizer: "Captain David Wilson"
    },
    {
      id: 6,
      title: "Marine Engineering Innovation Summit",
      type: "Conference",
      category: "Marine Engineering",
      startDate: "2024-04-05",
      endDate: "2024-04-07",
      startTime: "08:30",
      endTime: "18:00",
      location: "Marriott Hotel, Seattle",
      maxAttendees: 300,
      registeredAttendees: 234,
      status: "Upcoming",
      cost: "$750",
      organizer: "Commander Sarah Johnson"
    }
  ];

  const eventTypes = ["All", "Conference", "Workshop", "Seminar", "Training", "Meeting"];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "" || event.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming": return "info";
      case "Ongoing": return "success";
      case "Completed": return "default";
      case "Cancelled": return "error";
      default: return "default";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Conference": return "info";
      case "Workshop": return "warning";
      case "Seminar": return "success";
      case "Training": return "error";
      case "Meeting": return "default";
      default: return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRegistrationProgress = (registered, max) => {
    return Math.round((registered / max) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events Management</h2>
          <p className="text-gray-600">Manage and monitor all training events</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Event
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search events by title or organizer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="lg:w-64">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {eventTypes.map(type => (
                <option key={type} value={type === "All" ? "" : type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Filters Button */}
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Events</p>
              <p className="text-2xl font-bold text-blue-600">
                {events.filter(e => e.status === "Upcoming").length}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Attendees</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.reduce((sum, event) => sum + event.registeredAttendees, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ongoing Events</p>
              <p className="text-2xl font-bold text-green-600">
                {events.filter(e => e.status === "Ongoing").length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold">▶</span>
            </div>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Event</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date & Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Attendees</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Cost</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600">{event.organizer}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge color={getTypeColor(event.type)}>{event.type}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm text-gray-900">{formatDate(event.startDate)}</p>
                      {event.startDate !== event.endDate && (
                        <p className="text-sm text-gray-900">to {formatDate(event.endDate)}</p>
                      )}
                      <p className="text-xs text-gray-600">{event.startTime} - {event.endTime}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      {event.location === "Online" ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-sm text-gray-900">Online</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-900">{event.location}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm text-gray-900">{event.registeredAttendees}/{event.maxAttendees}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${getRegistrationProgress(event.registeredAttendees, event.maxAttendees)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">{getRegistrationProgress(event.registeredAttendees, event.maxAttendees)}%</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge color={getStatusColor(event.status)}>{event.status}</Badge>
                  </td>
                  <td className="py-4 px-4 text-gray-900 font-medium">{event.cost}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {filteredEvents.length} of {events.length} events
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="primary" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsTable;
