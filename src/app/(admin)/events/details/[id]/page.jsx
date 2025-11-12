"use client";

import React from "react";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { ArrowLeft, Edit, Trash2, Users, Calendar, MapPin, Clock, DollarSign } from "lucide-react";

export default function EventDetailsPage({ params }) {
  const { id } = params;

  // In a real app, you would fetch the event data by ID
  const eventData = {
    id: id,
    title: "Naval Engineering Conference 2024",
    description: "Annual conference bringing together naval engineers, researchers, and industry experts to discuss the latest developments in naval technology and engineering.",
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
    cost: 500,
    organizer: "Commander James Rodriguez",
    agenda: [
      {
        time: "09:00 - 10:30",
        title: "Opening Keynote",
        speaker: "Admiral Sarah Johnson",
        description: "Future of Naval Engineering"
      },
      {
        time: "11:00 - 12:30",
        title: "Panel Discussion",
        speaker: "Multiple Speakers",
        description: "Modern Ship Design Challenges"
      },
      {
        time: "14:00 - 15:30",
        title: "Technical Workshop",
        speaker: "Commander Mike Chen",
        description: "Propulsion Systems Innovation"
      }
    ],
    materials: [
      "Conference Program",
      "Technical Papers",
      "Networking Guide"
    ],
    requirements: [
      "Valid ID required",
      "Security clearance for base access",
      "Pre-registration mandatory"
    ]
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Event Details"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Events", href: "/admin/events" },
          { label: "Event Details", href: `/admin/events/details/${id}` }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Event
          </Button>
          <Button variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
            Delete Event
          </Button>
        </div>
      </div>

      {/* Event Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{eventData.title}</h1>
            <p className="text-gray-600 mt-2">{eventData.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge color="info">{eventData.type}</Badge>
            <Badge color="default">{eventData.category}</Badge>
            <Badge color={eventData.status === "Upcoming" ? "info" : "success"}>
              {eventData.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{eventData.startDate} - {eventData.endDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{eventData.startTime} - {eventData.endTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{eventData.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">${eventData.cost}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Organizer</label>
              <p className="text-gray-900">{eventData.organizer}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Attendees</label>
              <p className="text-gray-900">{eventData.registeredAttendees} / {eventData.maxAttendees}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(eventData.registeredAttendees / eventData.maxAttendees) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Capacity</label>
              <p className="text-gray-900">{Math.round((eventData.registeredAttendees / eventData.maxAttendees) * 100)}% filled</p>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
          <ul className="space-y-2">
            {eventData.requirements.map((requirement, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span className="text-gray-900">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Event Agenda */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Agenda</h3>
        <div className="space-y-4">
          {eventData.agenda.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-blue-600">{item.time}</span>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Speaker: {item.speaker}</p>
                  <p className="text-gray-900">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Materials</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {eventData.materials.map((material, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-gray-600 font-semibold">📄</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{material}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
