"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Button } from "@/components/ui";
import { ArrowLeft, Users, Mail, Phone, Calendar, Loader2 } from "lucide-react";
import * as eventAPI from "@/lib/api/event";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";

export default function EventRegistrationsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [maxAttendees, setMaxAttendees] = useState(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await eventAPI.getEventAttendees(id);
        
        if (response.success) {
          const data = response.data;
          setEventTitle(data.eventTitle || "Event");
          setAttendees(data.attendees || []);
          setTotalAttendees(data.totalAttendees || 0);
          setMaxAttendees(data.maxAttendees || null);
        } else {
          setError(response.message || 'Failed to fetch registrations');
        }
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setError(err.message || 'Failed to fetch registrations');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRegistrations();
    }
  }, [id]);

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <PageBreadcrumb items={[
          { label: "Events", href: "/events" },
          { label: "Details", href: `/events/details/${id}` },
          { label: "Registrations" }
        ]} />
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Event Registrations"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Events", href: "/events" },
          { label: "Event Details", href: `/events/details/${id}` },
          { label: "Registrations" }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/events/details/${id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Event
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Registrations</h1>
            <p className="text-gray-600 mt-1">{eventTitle}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalAttendees}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {maxAttendees && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {maxAttendees}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Spots</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.max(0, maxAttendees - totalAttendees)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Registered Attendees</h2>
        </div>
        {attendees.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Registrations Yet</h3>
            <p className="text-gray-600">There are no registered attendees for this event.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableCell isHeader className="font-semibold text-gray-700 py-3 px-6">
                    #
                  </TableCell>
                  <TableCell isHeader className="font-semibold text-gray-700 py-3 px-6">
                    Name
                  </TableCell>
                  <TableCell isHeader className="font-semibold text-gray-700 py-3 px-6">
                    Email
                  </TableCell>
                  <TableCell isHeader className="font-semibold text-gray-700 py-3 px-6">
                    Phone
                  </TableCell>
                  <TableCell isHeader className="font-semibold text-gray-700 py-3 px-6">
                    Registered On
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map((attendee, index) => (
                  <TableRow key={attendee._id || attendee.id || index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="text-gray-600 py-4 px-6">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 py-4 px-6">
                      {attendee.firstName && attendee.lastName
                        ? `${attendee.firstName} ${attendee.lastName}`
                        : attendee.firstName || attendee.lastName || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-600 py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{attendee.email || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{attendee.phone || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 py-4 px-6">
                      {formatDate(attendee.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

