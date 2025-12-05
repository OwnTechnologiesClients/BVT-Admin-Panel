"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Switch } from "@/components/ui";
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, Calendar, MapPin, Users, Clock, Loader2 } from "lucide-react";
import * as eventAPI from "@/lib/api/event";
import * as eventCategoryAPI from "@/lib/api/eventCategory";
import * as courseCategoryAPI from "@/lib/api/courseCategory";
import { showSuccess, showError } from "@/lib/utils/sweetalert";

const MultiStepEventForm = ({ initialData = null, isEdit = false }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventCategories, setEventCategories] = useState([]);
  const [courseCategories, setCourseCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    title: "",
    description: "",
    eventType: "",
    category: "",
    maxAttendees: "",
    isOnline: false,
    mealForAttendees: false,
    eventImage: null,
    tags: [],
    status: "draft",
    
    // Step 2: Event Details
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    onlineLink: "",
    registrationDeadline: "",
    cost: "",
    
    // Step 3: Speakers
    speakers: [
      {
        id: 1,
        name: "",
        bio: "",
        company: "",
        title: "",
        photo: null,
        email: "",
        linkedin: "",
        topics: ""
      }
    ],
    
    // Step 4: Event Schedule
    agenda: [
      {
        id: 1,
        time: "",
        title: "",
        description: "",
        speaker: "",
        duration: ""
      }
    ]
  });

  const totalSteps = 4;

  // Fetch categories and initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event categories (themes)
        const eventCategoriesResponse = await eventCategoryAPI.getAllCategories({ limit: 100 });
        if (eventCategoriesResponse.success) {
          setEventCategories(eventCategoriesResponse.data || []);
        }

        // Fetch course categories
        const courseCategoriesResponse = await courseCategoryAPI.getAllCategories({ limit: 100 });
        if (courseCategoriesResponse.success) {
          setCourseCategories(courseCategoriesResponse.data || []);
        }

        // If editing, fetch event data
        if (isEdit && initialData?.id) {
          setLoading(true);
          const eventResponse = await eventAPI.getEventById(initialData.id);
          if (eventResponse.success) {
            const event = eventResponse.data;
            setFormData({
              title: event.title || "",
              description: event.description || "",
              eventType: event.eventType?._id || event.eventType || "",
              category: event.category?._id || event.category || "",
              maxAttendees: event.maxAttendees?.toString() || "",
              isOnline: event.isOnline || false,
              mealForAttendees: event.mealForAttendees || false,
              eventImage: event.eventImage || null,
              tags: event.tags || [],
              status: event.status || "draft",
              startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : "",
              endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : "",
              startTime: event.startTime || "",
              endTime: event.endTime || "",
              location: event.location || "",
              onlineLink: event.onlineLink || "",
              registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : "",
              cost: event.cost?.toString() || "",
              speakers: event.speakers && event.speakers.length > 0 
                ? event.speakers.map((s, idx) => ({ ...s, id: s.id || s._id || idx + 1 }))
                : [{ id: 1, name: "", bio: "", company: "", title: "", photo: null, email: "", linkedin: "", topics: "" }],
              agenda: event.agenda && event.agenda.length > 0
                ? event.agenda.map((a, idx) => ({ ...a, id: a.id || a._id || idx + 1 }))
                : [{ id: 1, time: "", title: "", description: "", speaker: "", duration: "" }]
            });
          }
        } else if (initialData) {
          // Use provided initial data
          setFormData(prev => ({ ...prev, ...initialData }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isEdit, initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAgendaChange = (index, field, value) => {
    const updatedAgenda = [...formData.agenda];
    updatedAgenda[index][field] = value;
    setFormData(prev => ({
      ...prev,
      agenda: updatedAgenda
    }));
  };

  const addAgendaItem = () => {
    const newItem = {
      id: formData.agenda.length + 1,
      time: "",
      title: "",
      description: "",
      speaker: "",
      duration: ""
    };
    setFormData(prev => ({
      ...prev,
      agenda: [...prev.agenda, newItem]
    }));
  };

  const removeAgendaItem = (index) => {
    if (formData.agenda.length > 1) {
      const updatedAgenda = formData.agenda.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        agenda: updatedAgenda
      }));
    }
  };

  const handleSpeakerChange = (index, field, value) => {
    const updatedSpeakers = [...formData.speakers];
    updatedSpeakers[index][field] = value;
    setFormData(prev => ({
      ...prev,
      speakers: updatedSpeakers
    }));
  };

  const addSpeaker = () => {
    const newSpeaker = {
      id: formData.speakers.length + 1,
      name: "",
      bio: "",
      company: "",
      title: "",
      photo: null,
      email: "",
      linkedin: "",
      topics: ""
    };
    setFormData(prev => ({
      ...prev,
      speakers: [...prev.speakers, newSpeaker]
    }));
  };

  const removeSpeaker = (index) => {
    if (formData.speakers.length > 1) {
      const updatedSpeakers = formData.speakers.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        speakers: updatedSpeakers
      }));
    }
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const nextStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Check if there are any image uploads
      const hasEventImage = formData.eventImage && formData.eventImage instanceof File;
      const hasSpeakerPhotos = formData.speakers.some(s => s.photo && s.photo instanceof File);
      const hasImageUploads = hasEventImage || hasSpeakerPhotos;
      
      // Prepare speakers data (excluding File objects, they'll be added separately)
      const speakersData = formData.speakers.map(speaker => ({
        name: speaker.name.trim(),
        bio: speaker.bio?.trim() || "",
        company: speaker.company?.trim() || "",
        title: speaker.title?.trim() || "",
        photo: speaker.photo && typeof speaker.photo === 'string' ? speaker.photo : null, // Keep existing photo URL if not a File
        email: speaker.email?.trim() || "",
        linkedin: speaker.linkedin?.trim() || "",
        topics: speaker.topics?.trim() || ""
      }));
      
      // Prepare agenda data
      const agendaData = formData.agenda.map(item => ({
        time: item.time?.trim() || "",
        title: item.title.trim(),
        description: item.description?.trim() || "",
        speaker: item.speaker?.trim() || "",
        duration: item.duration?.trim() || ""
      }));
      
      let eventData;
      
      if (hasImageUploads) {
        // Use FormData if there are image uploads
        eventData = new FormData();
        eventData.append('title', formData.title.trim());
        eventData.append('description', formData.description.trim());
        eventData.append('eventType', formData.eventType);
        eventData.append('category', formData.category);
        if (formData.maxAttendees) {
          eventData.append('maxAttendees', parseInt(formData.maxAttendees));
        }
        eventData.append('isOnline', formData.isOnline);
        eventData.append('mealForAttendees', formData.mealForAttendees);
        eventData.append('startDate', formData.startDate);
        eventData.append('endDate', formData.endDate);
        if (formData.startTime) {
          eventData.append('startTime', formData.startTime);
        }
        if (formData.endTime) {
          eventData.append('endTime', formData.endTime);
        }
        if (!formData.isOnline && formData.location) {
          eventData.append('location', formData.location);
        }
        if (formData.isOnline && formData.onlineLink) {
          eventData.append('onlineLink', formData.onlineLink);
        }
        if (formData.registrationDeadline) {
          eventData.append('registrationDeadline', formData.registrationDeadline);
        }
        eventData.append('cost', formData.cost ? parseFloat(formData.cost) : 0);
        eventData.append('status', formData.status || 'draft');
        eventData.append('tags', JSON.stringify(formData.tags || []));
        eventData.append('speakers', JSON.stringify(speakersData));
        eventData.append('agenda', JSON.stringify(agendaData));
        
        // Append eventImage if it's a File
        if (hasEventImage) {
          eventData.append('eventImage', formData.eventImage);
        } else if (formData.eventImage && typeof formData.eventImage === 'string') {
          // Keep existing image URL if not a File
          eventData.append('eventImage', formData.eventImage);
        }
        
        // Append speaker photos with proper fieldnames
        formData.speakers.forEach((speaker, index) => {
          if (speaker.photo && speaker.photo instanceof File) {
            eventData.append(`speakerPhoto[${index}]`, speaker.photo);
          }
        });
      } else {
        // Use plain object if no image uploads
        eventData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          eventType: formData.eventType,
          category: formData.category,
          maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
          isOnline: formData.isOnline,
          mealForAttendees: formData.mealForAttendees,
          eventImage: formData.eventImage && typeof formData.eventImage === 'string' ? formData.eventImage : null,
          startDate: formData.startDate,
          endDate: formData.endDate,
          startTime: formData.startTime || undefined,
          endTime: formData.endTime || undefined,
          location: formData.isOnline ? undefined : formData.location,
          onlineLink: formData.isOnline ? formData.onlineLink : undefined,
          registrationDeadline: formData.registrationDeadline || undefined,
          cost: formData.cost ? parseFloat(formData.cost) : 0,
          status: formData.status || 'draft',
          tags: formData.tags || [],
          speakers: speakersData,
          agenda: agendaData
        };
      }

      let response;
      if (isEdit && initialData?.id) {
        response = await eventAPI.updateEvent(initialData.id, eventData);
      } else {
        response = await eventAPI.createEvent(eventData);
      }
      
      if (response.success) {
        showSuccess(
          isEdit ? 'Event Updated!' : 'Event Created!',
          `The event has been ${isEdit ? 'updated' : 'created'} successfully.`
        );
        setTimeout(() => {
        router.push('/events');
        }, 1500);
      } else {
        showError('Error', response.message || `Failed to ${isEdit ? 'update' : 'create'} event`);
      }
    } catch (err) {
      showError('Error', err.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
      
      {/* Event Image Upload */}
      <div className="flex flex-col items-center gap-4">
        <label className="block text-sm font-semibold text-gray-700">Event Cover Image <span className="font-normal text-xs text-gray-400">(optional)</span></label>
        {formData.eventImage ? (
          <div className="relative group">
            <img
              src={typeof formData.eventImage === 'string' ? formData.eventImage : URL.createObjectURL(formData.eventImage)}
              alt="Event cover"
              className="rounded-xl border border-gray-200 max-h-48 max-w-md object-cover shadow-md"
            />
            <button
              type="button"
              onClick={() => handleInputChange("eventImage", null)}
              className="absolute top-2 right-2 bg-white hover:bg-red-100 rounded-full p-2 text-red-600 border border-red-200 shadow"
              title="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="block cursor-pointer bg-white border border-dashed border-gray-300 rounded-xl px-6 py-8 min-h-[200px] min-w-[300px] flex flex-col items-center justify-center text-center text-gray-500 hover:border-blue-400 transition-all">
            <Plus className="w-12 h-12 mb-2" />
            <span className="font-medium">Click to upload event cover image</span>
            <input
              type="file"
              accept="image/*"
              onChange={e => handleInputChange("eventImage", e.target.files[0])}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter event title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Theme <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.eventType}
            onChange={(e) => handleInputChange("eventType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select event theme</option>
            {eventCategories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select category</option>
            {courseCategories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Attendees <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="number"
            value={formData.maxAttendees}
            onChange={(e) => handleInputChange("maxAttendees", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter max attendees"
          />
        </div>

        <div className="flex items-center space-x-3">
          <Switch
            checked={formData.isOnline}
            onChange={(checked) => handleInputChange("isOnline", checked)}
          />
          <label className="text-sm font-medium text-gray-700">
            Online Event
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <Switch
            checked={formData.mealForAttendees}
            onChange={(checked) => handleInputChange("mealForAttendees", checked)}
          />
          <label className="text-sm font-medium text-gray-700">
            Meal Provided for Attendees
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="draft">Draft</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Published events will appear in the upcoming events list
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter event description"
          required
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags / Topics
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Type a tag and press Enter"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(e.target.value.trim());
              e.target.value = '';
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange("startDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange("endDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => handleInputChange("startTime", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => handleInputChange("endTime", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {!formData.isOnline && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter event location"
              required
            />
          </div>
        )}

        {formData.isOnline && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Online Link <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.onlineLink}
              onChange={(e) => handleInputChange("onlineLink", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter online meeting link"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Registration Deadline <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={formData.registrationDeadline}
            onChange={(e) => handleInputChange("registrationDeadline", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => handleInputChange("cost", e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Event Speakers</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSpeaker}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Speaker
        </Button>
      </div>

      {formData.speakers.map((speaker, index) => (
        <div key={speaker.id || `speaker-${index}`} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Speaker {index + 1}</h4>
            {formData.speakers.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeSpeaker(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={speaker.name}
                onChange={(e) => handleSpeakerChange(index, "name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title/Position <span className="text-gray-400 text-xs">(optional)</span></label>
              <input
                type="text"
                value={speaker.title}
                onChange={(e) => handleSpeakerChange(index, "title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company/Organization <span className="text-gray-400 text-xs">(optional)</span></label>
              <input
                type="text"
                value={speaker.company}
                onChange={(e) => handleSpeakerChange(index, "company", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-gray-400 text-xs">(optional)</span></label>
              <input
                type="email"
                value={speaker.email}
                onChange={(e) => handleSpeakerChange(index, "email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL <span className="text-gray-400 text-xs">(optional)</span></label>
              <input
                type="url"
                value={speaker.linkedin}
                onChange={(e) => handleSpeakerChange(index, "linkedin", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Speaker Photo</label>
              {speaker.photo ? (
                <div className="relative inline-block">
                  <img
                    src={typeof speaker.photo === 'string' ? speaker.photo : URL.createObjectURL(speaker.photo)}
                    alt={speaker.name}
                    className="rounded-lg border border-gray-200 max-h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleSpeakerChange(index, "photo", null)}
                    className="absolute top-1 right-1 bg-white hover:bg-red-100 rounded-full p-1 text-red-600 border border-red-200"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer bg-white border border-dashed border-gray-300 rounded-lg px-4 py-3 w-fit hover:border-blue-400 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleSpeakerChange(index, "photo", e.target.files[0])}
                    className="hidden"
                  />
                  Click to upload photo
                </label>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio *</label>
              <textarea
                value={speaker.bio}
                onChange={(e) => handleSpeakerChange(index, "bio", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Speaking Topics</label>
              <input
                type="text"
                value={speaker.topics}
                onChange={(e) => handleSpeakerChange(index, "topics", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Marine Engineering, Navigation Systems, Safety Protocols"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Event Schedule</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAgendaItem}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Agenda Item
        </Button>
      </div>

      {formData.agenda.map((item, index) => (
        <div key={item.id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Agenda Item {index + 1}</h4>
            {formData.agenda.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAgendaItem(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time * <span className="text-gray-400 text-xs">(e.g., 09:00 - 10:30 or 09:00 AM - 10:30 AM)</span>
              </label>
              <input
                type="text"
                value={item.time || ""}
                onChange={(e) => handleAgendaChange(index, "time", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 09:00 - 10:30"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                value={item.duration}
                onChange={(e) => handleAgendaChange(index, "duration", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 30 minutes, 1 hour"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speaker <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <select
                value={item.speaker}
                onChange={(e) => handleAgendaChange(index, "speaker", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a speaker</option>
                {formData.speakers.filter(s => s.name.trim()).map((speaker, speakerIdx) => (
                  <option key={speaker.id || `speaker-option-${speakerIdx}`} value={speaker.name}>
                    {speaker.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => handleAgendaChange(index, "title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter agenda item title"
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={item.description}
              onChange={(e) => handleAgendaChange(index, "description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter agenda item description"
              required
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {[...Array(totalSteps)].map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 <= currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    index + 1 < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <span className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      <form 
        onSubmit={(e) => {
          // Only submit on the last step
          if (currentStep === totalSteps) {
            handleSubmit(e);
          } else {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onKeyDown={(e) => {
          // Prevent Enter key from submitting form unless on last step
          if (e.key === 'Enter' && currentStep < totalSteps) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="primary"
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                className="flex items-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                <Save className="w-4 h-4" />
                {isEdit ? 'Update Event' : 'Create Event'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default MultiStepEventForm;
