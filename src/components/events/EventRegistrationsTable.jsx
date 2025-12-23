"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/common/DataTable";
import { Mail, Phone } from "lucide-react";
import * as eventAPI from "@/lib/api/event";
import { showError } from "@/lib/utils/sweetalert";

const EventRegistrationsTable = ({ eventId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [maxAttendees, setMaxAttendees] = useState(null);
  const hasInitialFetch = useRef(false);

  // Fetch registrations
  const fetchRegistrations = useCallback(async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await eventAPI.getEventAttendees(eventId);
      
      if (response.success) {
        const data = response.data;
        setEventTitle(data.eventTitle || "Event");
        setAttendees(data.attendees || []);
        setTotalAttendees(data.totalAttendees || 0);
        setMaxAttendees(data.maxAttendees || null);
      } else {
        setError(response.message || 'Failed to fetch registrations');
        showError('Error Loading Registrations', response.message || 'Failed to fetch registrations');
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
      const errorMsg = err.message || 'Failed to fetch registrations';
      setError(errorMsg);
      showError('Error Loading Registrations', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Initial fetch - only run once even in Strict Mode
  useEffect(() => {
    if (hasInitialFetch.current) return;
    hasInitialFetch.current = true;
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "N/A";
    }
  };

  // Format attendees for display
  const formattedAttendees = attendees.map((attendee, index) => ({
    id: attendee._id || attendee.id || index,
    number: index + 1,
    name: attendee.firstName && attendee.lastName
      ? `${attendee.firstName} ${attendee.lastName}`
      : attendee.firstName || attendee.lastName || "N/A",
    email: attendee.email || "N/A",
    phone: attendee.phone || "N/A",
    registeredOn: formatDate(attendee.createdAt)
  }));

  const columns = [
    {
      key: "number",
      label: "#"
    },
    {
      key: "name",
      label: "Name"
    },
    {
      key: "email",
      label: "Email",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: "phone",
      label: "Phone",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: "registeredOn",
      label: "Registered On"
    }
  ];

  const stats = [
    {
      label: "Total Registrations",
      value: totalAttendees,
      icon: "👥",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    ...(maxAttendees ? [
      {
        label: "Capacity",
        value: maxAttendees,
        icon: "📅",
        bgColor: "bg-green-100",
        iconColor: "text-green-600"
      },
      {
        label: "Available Spots",
        value: Math.max(0, maxAttendees - totalAttendees),
        icon: "👥",
        bgColor: "bg-yellow-100",
        iconColor: "text-yellow-600"
      }
    ] : [])
  ];

  if (loading && attendees.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading registrations...</p>
      </div>
    );
  }

  if (error && attendees.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <DataTable
      title="Registered Attendees"
      description={eventTitle ? `Attendees registered for "${eventTitle}"` : "Event Registrations"}
      data={formattedAttendees}
      columns={columns}
      searchPlaceholder="Search attendees by name, email, or phone..."
      filters={[]}
      stats={stats}
      pagination={null}
      serverSide={false}
    />
  );
};

export default EventRegistrationsTable;

