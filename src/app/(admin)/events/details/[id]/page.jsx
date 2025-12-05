"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/common";
import { Badge, Button } from "@/components/ui";
import { ArrowLeft, Edit, Trash2, Users, Calendar, MapPin, Clock, DollarSign, Loader2 } from "lucide-react";
import * as eventAPI from "@/lib/api/event";
import { showSuccess, showError, showDeleteConfirm } from "@/lib/utils/sweetalert";

export default function EventDetailsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await eventAPI.getEventById(id);
        if (response.success) {
          setEventData(response.data);
        } else {
          setError(response.message || 'Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Failed to fetch event');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const handleDelete = async () => {
    const result = await showDeleteConfirm(
      `Delete "${eventData?.title}"?`,
      'This action cannot be undone. All event data will be permanently deleted.'
    );
    
    if (result.isConfirmed) {
      try {
        setDeleting(true);
        const response = await eventAPI.deleteEvent(id);
        if (response.success) {
          showSuccess('Event Deleted!', `"${eventData?.title}" has been deleted successfully.`);
          setTimeout(() => {
            router.push('/events');
          }, 1500);
        } else {
          showError('Delete Failed', response.message || 'Failed to delete event');
        }
      } catch (err) {
        showError('Error', err.message || 'Failed to delete event');
      } finally {
        setDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb 
          pageTitle="Event Details"
          breadcrumbs={[
            { label: "Home", href: "/admin/dashboard" },
            { label: "Events", href: "/events" },
            { label: "Event Details", href: `/events/details/${id}` }
          ]}
        />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-600">{error || 'Event not found'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/events')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  // Format event type - handle both object and string
  const typeMap = {
    'conference': 'Conference',
    'workshop': 'Workshop',
    'training': 'Training',
    'seminar': 'Seminar',
    'meeting': 'Meeting'
  };
  const getEventType = (eventType) => {
    if (!eventType) return 'N/A';
    if (typeof eventType === 'object' && eventType !== null) {
      return eventType.name || 'N/A';
    }
    if (typeof eventType === 'string') {
      return typeMap[eventType] || eventType || 'N/A';
    }
    return 'N/A';
  };
  const eventType = getEventType(eventData.eventType);

  // Determine status based on dates
  let status = "Upcoming";
  if (eventData.startDate && eventData.endDate) {
    const now = new Date();
    const start = new Date(eventData.startDate);
    const end = new Date(eventData.endDate);
    if (now > end) {
      status = "Completed";
    } else if (now >= start && now <= end) {
      status = "Ongoing";
    }
  }

  const startDate = eventData.startDate ? new Date(eventData.startDate).toISOString().split('T')[0] : 'N/A';
  const endDate = eventData.endDate ? new Date(eventData.endDate).toISOString().split('T')[0] : 'N/A';
  const cost = eventData.cost === 0 || eventData.cost === null ? 'Free' : `$${eventData.cost}`;

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle="Event Details"
        breadcrumbs={[
          { label: "Home", href: "/admin/dashboard" },
          { label: "Events", href: "/events" },
          { label: "Event Details", href: `/events/details/${id}` }
        ]}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push('/events')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Button>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => router.push(`/events/update/${id}`)}
          >
            <Edit className="w-4 h-4" />
            Edit Event
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete Event
          </Button>
        </div>
      </div>

      {/* Event Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Image */}
          {eventData.eventImage && (
            <div className="lg:col-span-1">
              <img 
                src={eventData.eventImage} 
                alt={eventData.title}
                className="w-full h-64 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.src = '/images/event-placeholder.jpg';
                }}
              />
            </div>
          )}
          
          {/* Event Info */}
          <div className={`space-y-4 ${eventData.eventImage ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{eventData.title}</h1>
              <p className="text-gray-600 mt-2">{eventData.description || 'No description available'}</p>
            </div>

          <div className="flex flex-wrap gap-2">
            <Badge color="info">{eventType}</Badge>
            <Badge color="default">
              {(() => {
                const category = eventData.category;
                if (!category) return 'N/A';
                if (typeof category === 'object' && category !== null) {
                  return category.name || 'N/A';
                }
                return String(category);
              })()}
            </Badge>
            <Badge color={status === "Upcoming" ? "info" : status === "Ongoing" ? "warning" : "success"}>
              {status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{startDate} - {endDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {eventData.startTime || 'N/A'} - {eventData.endTime || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {eventData.isOnline ? 'Online' : (eventData.location || 'N/A')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">{cost}</span>
            </div>
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
            {eventData.organizer && (
              <div>
                <label className="text-sm font-medium text-gray-700">Organizer</label>
                <p className="text-gray-900">{eventData.organizer}</p>
              </div>
            )}
            {eventData.maxAttendees && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Attendees</label>
                  <p className="text-gray-900">
                    {eventData.registeredAttendees || 0} / {eventData.maxAttendees}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(((eventData.registeredAttendees || 0) / eventData.maxAttendees) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Capacity</label>
                  <p className="text-gray-900">
                    {Math.round(((eventData.registeredAttendees || 0) / eventData.maxAttendees) * 100)}% filled
                  </p>
                </div>
              </>
            )}
            {eventData.onlineLink && eventData.isOnline && (
              <div>
                <label className="text-sm font-medium text-gray-700">Online Link</label>
                <p className="text-gray-900 break-all">
                  <a href={eventData.onlineLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {eventData.onlineLink}
                  </a>
                </p>
              </div>
            )}
            {eventData.registrationDeadline && (
              <div>
                <label className="text-sm font-medium text-gray-700">Registration Deadline</label>
                <p className="text-gray-900">
                  {new Date(eventData.registrationDeadline).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Speakers */}
        {eventData.speakers && eventData.speakers.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Speakers</h3>
            <div className="space-y-3">
              {eventData.speakers.map((speaker, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 flex items-start gap-3">
                  {speaker.photo && (
                    <img 
                      src={speaker.photo} 
                      alt={speaker.name || 'Speaker'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                      onError={(e) => {
                        e.target.src = '/images/speaker-placeholder.jpg';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{speaker.name}</p>
                    {speaker.title && <p className="text-sm text-gray-600">{speaker.title}</p>}
                    {speaker.company && <p className="text-sm text-gray-600">{speaker.company}</p>}
                    {speaker.bio && <p className="text-sm text-gray-500 mt-1">{speaker.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Event Agenda */}
      {eventData.agenda && eventData.agenda.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Agenda</h3>
          <div className="space-y-4">
            {eventData.agenda.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-blue-600">
                        {item.time || 'TBD'}
                        {item.duration && ` (${item.duration})`}
                      </span>
                      <h4 className="font-medium text-gray-900">{item.title || 'Untitled'}</h4>
                    </div>
                    {item.speaker && (
                      <p className="text-sm text-gray-600 mb-1">Speaker: {item.speaker}</p>
                    )}
                    {item.description && (
                      <p className="text-gray-900">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {eventData.tags && eventData.tags.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags / Topics</h3>
          <div className="flex flex-wrap gap-2">
            {eventData.tags.map((tag, index) => (
              <Badge key={index} color="default">{tag}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
